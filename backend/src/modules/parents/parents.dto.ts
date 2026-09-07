/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DTOs for Parent Management
 * Defines data transfer objects for parent-related operations
 */

// Base Parent DTOs
export interface CreateParentDto {
  user_id?: string;
  full_name: string;
  relationship?: string;
  emergency_contact?: string;
  phone?: string;
  email?: string;
  profile_picture_url?: string;
}

export interface UpdateParentDto {
  full_name?: string;
  relationship?: string;
  emergency_contact?: string;
  phone?: string;
  email?: string;
  profile_picture_url?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

// Parent Profile DTO (combines parent and user data)
export interface ParentProfileDto {
  id: string;
  user_id?: string;
  school_id: string;
  full_name: string;
  relationship?: string;
  emergency_contact?: string;
  phone?: string;
  email?: string;
  profile_picture_url?: string;
  status?: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  // Associated students count (if available)
  associated_students_count?: number;
}

// Query parameters for listing parents
export interface ListParentsQueryDto {
  search?: string;
  status?: 'active' | 'inactive' | 'suspended';
  relationship?: string;
  limit?: number;
  offset?: number;
}

// Parent with user details
export interface ParentWithUserDto {
  id: string;
  user_id?: string;
  school_id: string;
  full_name: string;
  relationship?: string;
  emergency_contact?: string;
  user?: {
    id: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive' | 'suspended';
    profile_picture_url?: string;
  };
  created_at: string;
  updated_at: string;
}

// Bulk operations DTOs
export interface BulkCreateParentsDto {
  parents: CreateParentDto[];
}

export interface BulkUpdateParentsDto {
  parent_ids: string[];
  update_data: UpdateParentDto;
}

export interface BulkDeleteParentsDto {
  parent_ids: string[];
}
