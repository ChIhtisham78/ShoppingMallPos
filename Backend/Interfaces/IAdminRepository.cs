using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Dtos;
using Backend.Helpers;

namespace Backend.Interfaces
{
    public interface IAdminRepository
    {
        Task<List<ListProductsDto>> GetAllProductsAsync(ProductQuery query);
        Task<Product?> UpdateProductAsync(Product product, UpdateProductsDto productsDto);
        Task<List<ListProductsDto>> GetIndexProductItemsAsync(IndexProductQuery query);
        Task<List<ListRecentSaleDto>> GetIndexRecentProductItemsAsync();
        Task<List<ListSalesDto>> GetSalesProductItemsAsync(SalesProductQuery query);
        Task<SalesProductDetailsDto?> GetSalesProductDetailsAsync(int id);
        Task<List<ListSalesDto>?> GetUserProfileAsync(UserSalesQuery query, string id);
        

        
    }
}