export interface listArticleCommentDto {
  commentId?: string;
  articleId: string;
  cursor: string | undefined;
  limit: string | undefined;
}

export interface getArticleCommentByIdDto {
  commentId: number;
  articleId: number;
}

export interface createArticleCommentDto {
  content: string;
  commentId?: number;
  articleId: number;
  userId?: number;
}

export interface updateArticleCommentDto {
  content: string;
  commentId: number;
  articleId: number;
  userId?: number;
}

export interface deleteArticleCommentDto {
  commentId: number;
  articleId: number;
  userId?: number;
}
