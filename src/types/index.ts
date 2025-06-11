export interface Movie {
    id: number;
    title: string;
    description?: string | null;
    video_id: number;
}

export interface Video {
    id: number;
    filename: string;
    title?: string | null;
    cdn_path?: string | null;
    uploaded?: Date | null;
    views?: number;
    entertainment_type?: string | null;
    thumbnail_path?: string | null;
}

export interface Show {
    id: number;
    name: string;
    video_id: number;
    season: number;
}