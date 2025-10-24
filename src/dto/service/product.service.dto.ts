export interface listProductDto {
  page?: number;
  pageSize?: number;
  keyword?: string[];
}

export interface getProductByIdDto {
  id: number;
  userId?: number | undefined;
}

export interface createProductDto {
  name: string;
  description: string;
  price: number;
  tags?: string[];
  userId?: number;
}

export interface updateProductDto {
  name: string;
  description: string;
  price: number;
  tags?: string[];
  id: number;
  userId?: number;
}

export interface deleteProductDto {
  id: number;
  userId?: number;
}

export interface toggleProductLikeDto {
  userId: number;
  id: number;
}
