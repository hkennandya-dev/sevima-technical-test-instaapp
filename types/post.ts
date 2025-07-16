import { User } from "@/types/user";

export interface Post {
  id: number;
  user_id: number;
  caption: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  user: User;
}