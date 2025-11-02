export interface listProductCommentDto {
  commentId?: string;
  productId: string;
  cursor: string | undefined;
  limit: string | undefined;
}

export interface getProductCommentByIdDto {
  commentId: number;
  productId: number;
}

export interface createProductCommentDto {
  content: string;
  commentId?: number;
  productId: number;
  userId?: number;
}

export interface updateProductCommentDto {
  content: string;
  commentId: number;
  productId: number;
  userId?: number;
}

export interface deleteProductCommentDto {
  commentId: number;
  productId: number;
  userId?: number;
}
