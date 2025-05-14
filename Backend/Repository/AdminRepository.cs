using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Dtos;
using Backend.Mappers;
using Backend.Helpers;

namespace Backend.Repository
{
    public class AdminRepository : IAdminRepository
    {
        public readonly ApplicationDBContext _context;
        public AdminRepository(
            ApplicationDBContext context
            )
        { 
            _context = context;
        }

        public async Task<List<ListProductsDto>> GetAllProductsAsync(ProductQuery query)
        {
            var products = _context.Products
            .OrderByDescending(x=>x.CreatedAt)
            .AsQueryable();
            if(!string.IsNullOrWhiteSpace(query.Name))
            {
                products = products.Where(x=>x.Name.Contains(query.Name)
                || x.Id.ToString().Contains(query.Name));
            };
            if(!string.IsNullOrWhiteSpace(query.Availability))
            {
                if (query.Availability == "available"){
                    products = products.Where(x=>x.Stock > 0);
                }else if (query.Availability == "unavailable"){
                    products = products.Where(x=>x.Stock <= 0);
                }
                
            };

            // Filter by Date range
            if (query.DateMin != default(DateTime))
            {
                Console.WriteLine($"datemin{query.DateMin}");
                products = products.Where(x => x.CreatedAt >= query.DateMin);
            }
            if (query.DateMax != default(DateTime))
            {
                Console.WriteLine($"datemax{query.DateMax}");
                products = products.Where(x => x.CreatedAt <= query.DateMax);
            }

            // Filter by Price range
            if (query.PriceMin.HasValue)
            {
                products = products.Where(x => x.Price >= query.PriceMin.Value);
            }
            if (query.PriceMax.HasValue)
            {
                products = products.Where(x => x.Price <= query.PriceMax.Value);
            }

            
            var productDtos = products
                .Select(x => x.ToListProductsDto());

            var SkipNumber = (query.PageNumber - 1) * query.PageSize;
            return productDtos.Skip(SkipNumber).Take(query.PageSize).ToList();
        }

        public async Task<List<ListProductsDto>> GetIndexProductItemsAsync(IndexProductQuery query)
        {
            var itemsProduct =  _context.Products
            .OrderByDescending(x=>x.CreatedAt)
            .AsQueryable();
            

            if (!string.IsNullOrWhiteSpace(query.Name))
            {
                itemsProduct = itemsProduct.Where(x=>x.Name!.Contains(query.Name)
                || x.Id.ToString().Contains(query.Name));

                var productDtos = itemsProduct
                .Select(x => x.ToListProductsDto());
                return await productDtos.ToListAsync();

            }
            else{
                return null;
            }
            
        }

        public async Task<List<ListRecentSaleDto>> GetIndexRecentProductItemsAsync()
        {
            var recentProduct = await _context.RecentSales
            .OrderByDescending(x=>x.Id)
            .Include(x=>x.Product)
            .Take(10)
            .ToListAsync();

            var recentProductDto = recentProduct.Select(x=>x.ToListRecentSaleDto());

            return recentProductDto.ToList();
        }

        public async Task<SalesProductDetailsDto?> GetSalesProductDetailsAsync(int id)
        {
            var salesDetails = await _context.Sales
            .Include(x=>x.AppUser)
            .Include(x=>x.SaleProducts)
                .ThenInclude(x=>x.Product)
            .FirstOrDefaultAsync(x=>x.Id==id);

            return salesDetails?.ToSalesProductDetailsDto();
        }

        public async Task<List<ListSalesDto>> GetSalesProductItemsAsync(SalesProductQuery query)
        {
            var sales =  _context.Sales
            .OrderByDescending(x=>x.CreatedAt)
            .Include(x=>x.AppUser)
            .Include(x=>x.SaleProducts)
                .ThenInclude(sp => sp.Product)
            .AsQueryable();
            if(!string.IsNullOrWhiteSpace(query.ProductName))
            {
                sales = sales.Where(x => x.SaleProducts
                    .Any(sp => sp.Product!.Name!.Contains(query.ProductName))
                || x.Id.ToString().Contains(query.ProductName));
            };
            if(!string.IsNullOrWhiteSpace(query.SalesAgent))
            {
                    sales = sales.Where(x=>x.AppUserId == query.SalesAgent);          
                
            };

            // Filter by Date range
            if (query.DateMin != default(DateTime))
            {
                sales = sales.Where(x => x.CreatedAt >= query.DateMin);
            }
            if (query.DateMax != default(DateTime))
            {
                sales = sales.Where(x => x.CreatedAt <= query.DateMax);
            }

            // Filter by Price range
            if (query.PriceMin.HasValue)
            {
                sales = sales.Where(x => x.GrandPrice >= query.PriceMin.Value);
            }
            if (query.PriceMax.HasValue)
            {
                sales = sales.Where(x => x.GrandPrice <= query.PriceMax.Value);
            }

            if(!string.IsNullOrWhiteSpace(query.CustomerName))
            {
                sales = sales.Where(x => x.CustomerName!.Contains(query.CustomerName));
            };

            
            var salesDtos = sales
                .Select(x => x.ToListSalesDto());

            
            return await salesDtos.ToListAsync();

        }

        public async Task<List<ListSalesDto>?> GetUserProfileAsync(string id,UserSalesQuery query)
        {
            var sales = _context.Sales
            .OrderByDescending(x=>x.CreatedAt)
            .Include(x=>x.AppUser)
            .Where(x => x.AppUserId == id)
            .AsQueryable();


            if (query.DateMin != default(DateTime))
            {
                sales = sales.Where(x => x.CreatedAt >= query.DateMin);
            }
            if (query.DateMax != default(DateTime))
            {
                sales = sales.Where(x => x.CreatedAt <= query.DateMax);
            }
            var salesDtos = sales
                .Select(x => x.ToListSalesDto());

            var SkipNumber = (query.PageNumber - 1) * query.PageSize;
            return await salesDtos.Skip(SkipNumber).Take(query.PageSize).ToListAsync();
                
        }


        public async Task<Product?> UpdateProductAsync( Product product, UpdateProductsDto productsDto)
        {
            product.Price = productsDto.Price;
            product.Name = productsDto.Name;
            product.Stock = productsDto.Stock;

            await _context.SaveChangesAsync();
            return product;
        }

        



    }
}