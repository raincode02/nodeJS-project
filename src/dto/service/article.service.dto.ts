export interface listArticleDto {
  page?: number;
  pageSize?: number;
  keyword?: string[];
}

export interface getArticleByIdDto {
  id: number;
  userId?: number | undefined;
}

export interface createArticleDto {
  title: string;
  content: string;
  userId?: number;
}

export interface updateArticleDto {
  title: string;
  content: string;
  id: number;
  userId?: number;
}

export interface deleteArticleDto {
  id: number;
  userId?: number;
}

export interface toggleArticleLikeDto {
  userId?: number;
  id: number;
}
