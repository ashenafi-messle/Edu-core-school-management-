import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

async function getTeacher(teacherId: string, schoolId: string) {
  if (!supabaseAdmin) {
    return null;
  }

  const { data } = await supabaseAdmin
    .from('teachers')
    .select('id, user_id, full_name')
    .eq('id', teacherId)
    .eq('school_id', schoolId)
    .maybeSingle();
  return data;
}

async function getAllocatedStudents(teacherId: string, schoolId: string) {
  if (!supabaseAdmin) {
    return [];
  }

  const { data: assignments } = await supabaseAdmin
    .from('subject_assignments')
    .select('grade_level, section_name')
    .eq('teacher_id', teacherId)
    .eq('school_id', schoolId)
    .eq('status', 'Active');

  const combos = Array.from(new Map((assignments || []).map((item: any) => [
    `${item.grade_level}|${item.section_name}`, item,
  ])).values()) as any[];
  const students: any[] = [];
  for (const combo of combos) {
    const { data } = await supabaseAdmin
      .from('students')
      .select('id, user_id, parent_id, full_name, grade_level, section')
      .eq('school_id', schoolId)
      .eq('grade_level', combo.grade_level)
      .eq('section', combo.section_name);
    students.push(...(data || []));
  }
  return Array.from(new Map(students.map((student) => [student.id, student])).values());
}

async function getGroupContacts(teacherId: string, schoolId: string) {
  const students = await getAllocatedStudents(teacherId, schoolId);
  const grouped = new Map<string, any[]>();
  students.forEach((student) => {
    const key = `${student.grade_level}|${student.section || 'Unassigned'}`;
    grouped.set(key, [...(grouped.get(key) || []), student]);
  });
  return Array.from(grouped.entries()).map(([key, members]) => {
    const [gradeLevel, sectionName] = key.split('|');
    return {
      contact_id: `group:${gradeLevel}:${sectionName}`,
      participant_type: 'group',
      category: 'groups',
      participant_name: `${gradeLevel} ${sectionName} Students`,
      subtitle: `${members.length} allocated students`,
      group_key: key,
      member_user_ids: members.map((student) => student.user_id).filter(Boolean),
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    const schoolId = requireSchoolId(request);
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacher_id');
    if (!teacherId) return NextResponse.json({ error: 'teacher_id is required.' }, { status: 400 });
    if (!await getTeacher(teacherId, schoolId)) return NextResponse.json({ error: 'Teacher not found.' }, { status: 404 });

    if (searchParams.get('mode') === 'contacts') {
      const students = await getAllocatedStudents(teacherId, schoolId);
      const parentIds = Array.from(new Set(students.map((student) => student.parent_id).filter(Boolean)));
      const [{ data: parents }, { data: directors }, { data: teachers }, groups] = await Promise.all([
        parentIds.length
          ? supabaseAdmin.from('parents').select('id, user_id, full_name').in('id', parentIds).eq('school_id', schoolId)
          : Promise.resolve({ data: [] }),
        supabaseAdmin.from('users').select('id, full_name').eq('school_id', schoolId).eq('role', 'director').eq('status', 'active'),
        supabaseAdmin.from('teachers').select('id, user_id, full_name').eq('school_id', schoolId).eq('status', 'Active').neq('id', teacherId),
        getGroupContacts(teacherId, schoolId),
      ]);

      const contacts = [
        ...students.map((student) => ({
          contact_id: student.user_id || student.id,
          participant_user_id: student.user_id,
          participant_entity_id: student.id,
          participant_type: 'student',
          category: 'students',
          participant_name: student.full_name,
          subtitle: `${student.grade_level} ${student.section || ''}`.trim(),
        })),
        ...(parents || []).map((parent: any) => ({
          contact_id: parent.user_id || parent.id,
          participant_user_id: parent.user_id,
          participant_entity_id: parent.id,
          participant_type: 'parent',
          category: 'parents',
          participant_name: parent.full_name,
          subtitle: 'Parent or guardian',
        })),
        ...(directors || []).map((director: any) => ({
          contact_id: director.id,
          participant_user_id: director.id,
          participant_entity_id: null,
          participant_type: 'director',
          category: 'directors',
          participant_name: director.full_name,
          subtitle: 'Campus director',
        })),
        ...(teachers || []).filter((teacher: any) => teacher.user_id).map((teacher: any) => ({
          contact_id: teacher.user_id,
          participant_user_id: teacher.user_id,
          participant_entity_id: teacher.id,
          participant_type: 'teacher',
          category: 'teachers',
          participant_name: teacher.full_name,
          subtitle: 'Teacher colleague',
        })),
        ...groups,
      ];
      return NextResponse.json(Array.from(new Map(contacts.map((contact) => [contact.contact_id, contact])).values()));
    }

    const teacher = await getTeacher(teacherId, schoolId);
    const { data: ownedConversations, error: ownedError } = await supabaseAdmin
      .from('teacher_conversations')
      .select('*')
      .eq('school_id', schoolId)
      .eq('teacher_id', teacherId)
      .order('updated_at', { ascending: false });
    if (ownedError) return NextResponse.json({ error: `Failed to load conversations: ${ownedError.message}` }, { status: 400 });

    let memberConversations: any[] = [];
    if (teacher?.user_id) {
      const { data: memberships, error: membershipError } = await supabaseAdmin
        .from('teacher_conversation_members')
        .select('conversation_id')
        .eq('school_id', schoolId)
        .eq('user_id', teacher.user_id);
      if (membershipError) return NextResponse.json({ error: `Failed to load group memberships: ${membershipError.message}` }, { status: 400 });
      const ids = (memberships || []).map((membership: any) => membership.conversation_id);
      if (ids.length > 0) {
        const { data, error } = await supabaseAdmin
          .from('teacher_conversations')
          .select('*')
          .eq('school_id', schoolId)
          .in('id', ids)
          .order('updated_at', { ascending: false });
        if (error) return NextResponse.json({ error: `Failed to load group conversations: ${error.message}` }, { status: 400 });
        memberConversations = data || [];
      }
    }

    const conversations = Array.from(new Map([...ownedConversations || [], ...memberConversations].map((conversation: any) => [conversation.id, conversation])).values());
    const result = await Promise.all(conversations.map(async (conversation: any) => {
      if (!supabaseAdmin) {
        throw new Error('Database connection not configured');
      }
      const { data: messages, error } = await supabaseAdmin
        .from('teacher_messages')
        .select('*')
        .eq('school_id', schoolId)
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
      if (error) throw new Error(`Failed to load messages: ${error.message}`);
      return { ...conversation, messages: messages || [] };
    }));
    return NextResponse.json(result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    const schoolId = requireSchoolId(request);
    const body = await request.json();
    const { teacher_id: teacherId, body: messageBody } = body;
    if (!teacherId) {
      return NextResponse.json({ error: 'teacher_id is required.' }, { status: 400 });
    }
    const teacher = await getTeacher(teacherId, schoolId);
    if (!teacher) return NextResponse.json({ error: 'Teacher not found.' }, { status: 404 });

    if (body.action === 'create_group') {
      if (!teacher.user_id) {
        return NextResponse.json({ error: 'This teacher is not linked to a user account, so a group cannot be created.' }, { status: 400 });
      }
      const memberUserIds = Array.from(new Set([teacher.user_id, ...(body.member_user_ids || [])].filter(Boolean)));
      if (memberUserIds.length < 2 || !body.group_name?.trim()) {
        return NextResponse.json({ error: 'A group name and at least one other member are required.' }, { status: 400 });
      }
      const { data: validUsers } = await supabaseAdmin.from('users').select('id, role').eq('school_id', schoolId).in('id', memberUserIds);
      if ((validUsers || []).length !== memberUserIds.length) return NextResponse.json({ error: 'One or more group members are invalid.' }, { status: 400 });
      const { data: conversation, error: conversationError } = await supabaseAdmin.from('teacher_conversations').insert({
        school_id: schoolId,
        teacher_id: teacherId,
        participant_user_id: teacher.user_id || null,
        participant_entity_id: teacher.id,
        participant_type: 'group',
        category: 'groups',
        participant_name: body.group_name.trim(),
        group_name: body.group_name.trim(),
        group_key: body.group_key || `custom:${Date.now()}`,
        is_group: true,
      }).select('id').single();
      if (conversationError) return NextResponse.json({ error: conversationError.message }, { status: 400 });
      const { error: membersError } = await supabaseAdmin.from('teacher_conversation_members').insert(memberUserIds.map((userId) => ({
        school_id: schoolId,
        conversation_id: conversation.id,
        user_id: userId,
        role: validUsers?.find((user) => user.id === userId)?.role || 'student',
      })));
      if (membersError) return NextResponse.json({ error: membersError.message }, { status: 400 });
      return NextResponse.json({ conversation_id: conversation.id }, { status: 201 });
    }

    if (!messageBody?.trim() || !body.participant_type || !body.participant_name) {
      return NextResponse.json({ error: 'recipient and message body are required.' }, { status: 400 });
    }

    let conversationQuery = supabaseAdmin
      .from('teacher_conversations')
      .select('id, teacher_id')
      .eq('school_id', schoolId)
      .eq('participant_type', body.participant_type);
    if (body.participant_type === 'group') {
      conversationQuery = conversationQuery.eq('group_key', body.group_key || '');
    } else {
      conversationQuery = conversationQuery.eq('teacher_id', teacherId);
      if (body.participant_user_id) conversationQuery = conversationQuery.eq('participant_user_id', body.participant_user_id);
      else conversationQuery = conversationQuery.eq('participant_entity_id', body.participant_entity_id);
    }
    const { data: existing } = await conversationQuery.maybeSingle();

    let conversation = existing;
    if (!conversation) {
      const { data, error } = await supabaseAdmin.from('teacher_conversations').insert({
        school_id: schoolId,
        teacher_id: teacherId,
        participant_user_id: body.participant_user_id || null,
        participant_entity_id: body.participant_entity_id || null,
        participant_type: body.participant_type,
        participant_name: body.participant_name,
        category: body.category,
      }).select('id, teacher_id').single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      conversation = data;
    }

    if (body.participant_type === 'group' && teacher.user_id && conversation) {
      const { data: membership } = await supabaseAdmin
        .from('teacher_conversation_members')
        .select('id')
        .eq('school_id', schoolId)
        .eq('conversation_id', conversation.id)
        .eq('user_id', teacher.user_id)
        .maybeSingle();
      if (!membership && conversation.teacher_id !== teacherId) {
        return NextResponse.json({ error: 'You are not a member of this group.' }, { status: 403 });
      }
    }

    const { data: message, error } = await supabaseAdmin.from('teacher_messages').insert({
      school_id: schoolId,
      conversation_id: conversation.id,
      sender_user_id: teacher.user_id || null,
      sender_role: 'teacher',
      body: messageBody.trim(),
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await supabaseAdmin.from('teacher_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversation.id).eq('school_id', schoolId);
    await supabaseAdmin.channel(`school-messages-${schoolId}`).send({
      type: 'broadcast',
      event: 'new-message',
      payload: { conversation_id: conversation.id, message },
    });
    return NextResponse.json({ conversation_id: conversation.id, message }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
