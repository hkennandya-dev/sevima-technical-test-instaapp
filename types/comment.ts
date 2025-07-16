export interface Comment {
    id: number;
    user_id: number;
    post_id: number;
    content: string;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        username: string;
    };
}
