import { IsUUID, IsString, IsEnum, IsInt, IsOptional, IsDate, Min, Max } from 'class-validator';

export enum AssignmentRole {
  PRIMARY_TEACHER = 'Primary Teacher',
  ASSISTANT_TEACHER = 'Assistant Teacher',
  LAB_INSTRUCTOR = 'Lab Instructor',
  GUEST_LECTURER = 'Guest Lecturer'
}

export enum AssignmentStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  COMPLETED = 'Completed'
}

export class CreateSubjectAssignmentDto {
  @IsUUID()
  teacher_id: string;

  @IsUUID()
  subject_id: string;

  @IsUUID()
  academic_year_id: string;

  @IsString()
  @IsEnum(['Fall', 'Spring', 'Summer', 'Winter'])
  semester: string;

  @IsOptional()
  @IsEnum(AssignmentRole)
  role?: AssignmentRole;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  sections_assigned?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(40)
  weekly_hours?: number;

  @IsOptional()
  @IsDate()
  assignment_date?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSubjectAssignmentDto {
  @IsOptional()
  @IsUUID()
  teacher_id?: string;

  @IsOptional()
  @IsUUID()
  subject_id?: string;

  @IsOptional()
  @IsUUID()
  academic_year_id?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['Fall', 'Spring', 'Summer', 'Winter'])
  semester?: string;

  @IsOptional()
  @IsEnum(AssignmentRole)
  role?: AssignmentRole;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  sections_assigned?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(40)
  weekly_hours?: number;

  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class SubjectAssignmentFilterDto {
  @IsOptional()
  @IsUUID()
  teacher_id?: string;

  @IsOptional()
  @IsUUID()
  subject_id?: string;

  @IsOptional()
  @IsUUID()
  academic_year_id?: string;

  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;
}