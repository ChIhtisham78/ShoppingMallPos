using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Dtos;
using Backend.Helpers;
using Backend.Interfaces;
using Backend.Mappers;
using Backend.Models;
using CsvHelper;
using ExcelDataReader;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("admin/api/")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        public readonly ApplicationDBContext _context;
        public readonly UserManager<AppUser> _userManager;
        public readonly SignInManager<AppUser> _signInManager;
        public readonly IJWTService _token;
        public readonly IAdminRepository _adminRepo;

        public AdminController(
             ApplicationDBContext context,
            SignInManager<AppUser> signInManager,
            UserManager<AppUser> userManager,
            IJWTService token,
            IAdminRepository adminRepo
        )
        {
            _context = context;
            _signInManager = signInManager;
            _userManager = userManager;
            _token = token;
            _adminRepo = adminRepo;
        }


        [HttpGet("admin/dashboard")]
        [Authorize]
        [Authorize(Policy = "IsAdmin")]
        public async Task<IActionResult> AdminDashboard()
        {
            var products = await _context.Products.ToListAsync();
            var totalProductCount =   products.Count;
            var availableProductCount =  products.Where(x => x.Stock >= 1).Count();
            var unavailableProductCount =  products.Where(x => x.Stock <= 0).Count();
            var totalProductItems = products.Sum(x=>x.Stock);
            var totalProductPrice = products.Sum(x=>x.Price);
            var totalUsers = await _userManager.Users.CountAsync();

            var sales = await _context.Sales.ToListAsync();
            var totalSales =sales.Count;
            var totalProductSoldPrice = sales.Sum(x=>x.GrandPrice);

            var recentSales = await _context.Sales
                .OrderByDescending(x=>x.CreatedAt)
                .Take(10)
                .Include(x=>x.AppUser)
                .Select(x=>x.ToListSalesDto())
                .ToListAsync();
            
            var recentProduct = await _context.Products
                .OrderByDescending(x => x.CreatedAt)
                .Take(10)
                .Select(x=>x.ToListProductsDto())
                .ToListAsync();




            return StatusCode(200, new
            {
               totalProduct = totalProductCount,
               availableProduct = availableProductCount,
               unavailableProduct = unavailableProductCount,
               totalProductItems= totalProductItems,
               totalProductPrice = totalProductPrice,
               totalProductSoldPrice= totalProductSoldPrice,
               totalUsers = totalUsers,
               totalSales = totalSales,
               recentProduct = recentProduct,
               recentSales = recentSales
            });

        }



        [HttpPost("create/salesAgent/")]
        [Authorize]
        [Authorize(Policy = "IsAdmin")]
        public async Task<IActionResult> CreateSalesAgent([FromBody] CreateSalesDto createSalesDto){
            if (!ModelState.IsValid){
                return StatusCode(400, new{message=ModelState});
            }
            try{
                var user = new AppUser{
                    Name = createSalesDto.Name,
                    UserName = createSalesDto.UserName,
                    IsAdmin = false,
                    IsSales=true,
                };
                var password = "Pass1234";
                var userModel = await _userManager.CreateAsync(user, password);
                if (userModel.Succeeded){
                    var role = await _userManager.AddToRoleAsync(user, "SALES");
                    if (role.Succeeded){
                        var otp = new Otp{
                        AppUserId = user.Id,
                        Question = createSalesDto.Question,
                        Answer= createSalesDto.Answer,
                        Token = _token.GenerateToken()
                        };
                        await _context.Otps.AddAsync(otp);
                        await _context.SaveChangesAsync();
                        // var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        // var admin = await _userManager.FindByIdAsync(userId);
                        // var action = $"Added a Student: {user.FirstName} {user.LastName}";
                        // var name = $"{admin.FirstName} {admin.LastName}";
                        // await _userRepo.CreateAuditAsync(name, action);
                    return StatusCode(201, new {message = $"Sales Account Successfully Created for {createSalesDto.Name}"});
                }else{return StatusCode(500, new {message = role.Errors});}
                
              }else{return StatusCode(500, new {message = userModel.Errors});}
                

            }catch(Exception e){return StatusCode(400, new{message= e});}

        }

        [HttpPost("create/product")]
        [Authorize]
        [Authorize(Policy = "IsAdmin")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto productDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid input data.", errors = ModelState });
            }

            if (productDto.Price <= 0)
            {
                return BadRequest(new { message = "Price must be greater than zero." });
            }

            if (productDto.Stock <= 0)
            {
                return BadRequest(new { message = "Stock must be greater than zero." });
            }

            var existingProduct = await _context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Name == productDto.Name);

            if (existingProduct != null)
            {
                return Conflict(new { message = "Product already exists. Please update it in the product list." });
            }

            var product = new Product
            {
                Name = productDto.Name!.Trim(),
                Stock = productDto.Stock,
                Price = productDto.Price
            };

            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product added successfully." });
        }


        [HttpGet("list/products")]
        [Authorize]
        public async Task<IActionResult> ListProducts([FromQuery] ProductQuery query)
        {
            var products = await _adminRepo.GetAllProductsAsync(query);
            var totalProducts = await _context.Products.CountAsync();
            return StatusCode(200, new{products = products,totalProducts=totalProducts});
        }

        [HttpPut("update/product/{id:int}")]
        [Authorize]
        [Authorize(Policy = "IsAdmin")]
        public async Task<IActionResult> UpdateProduct([FromBody] UpdateProductsDto productsDto, [FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid input data.", errors = ModelState });
            }

            if (productsDto.Price <= 0)
            {
                return BadRequest(new { message = "Price must be greater than zero." });
            }

            if (productsDto.Stock <= 0)
            {
                return BadRequest(new { message = "Stock must be greater than zero." });
            }

            var existingProduct = await _context.Products.FirstOrDefaultAsync(x => x.Id == id);
            if (existingProduct == null)
            {
                return NotFound(new { message = $"Product with ID {id} not found." });
            }

            // Optional: check if another product has the same name to prevent name conflict
            var duplicateNameProduct = await _context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Name == productsDto.Name && x.Id != id);
            if (duplicateNameProduct != null)
            {
                return Conflict(new { message = "Another product with the same name already exists." });
            }

            var updatedProduct = await _adminRepo.UpdateProductAsync(existingProduct, productsDto);
            if (updatedProduct == null)
            {
                return StatusCode(500, new { message = "An error occurred while updating the product." });
            }

            return Ok(new { message = "Product updated successfully.", product = updatedProduct });
        }



        [HttpGet("index/product/items")]
        [Authorize]
        public async Task<IActionResult> GetIndexProductItems([FromQuery] IndexProductQuery query){
            var itemsProduct = await _adminRepo.GetIndexProductItemsAsync(query);
            return StatusCode(200, itemsProduct);
        }

        [HttpGet("index/recent/product/items")]
        [Authorize]
        public async Task<IActionResult> GetIndexRecentProductItems(){
            var recentProduct = await _adminRepo.GetIndexRecentProductItemsAsync();
            return StatusCode(200, recentProduct);
        }

        [HttpPost("upload/product")]
        [Authorize]
        [Authorize(Policy = "IsAdmin")]
        public async Task<IActionResult> UploadProduct(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            var extension = Path.GetExtension(file.FileName).ToLower();
            var products = new List<UpdateProductsDto>();
            int successfulImports = 0;
            int duplicateCount = 0;
            int updateCount = 0;

            try
            {
                if (extension == ".csv")
                {
                    using var reader = new StreamReader(file.OpenReadStream());
                    using var csv = new CsvReader(reader, new CsvHelper.Configuration.CsvConfiguration(System.Globalization.CultureInfo.InvariantCulture));

                    csv.Read();
                    csv.ReadHeader();

                    string[] expectedHeaders = { "Name", "Price", "Stock" };
                    foreach (var header in expectedHeaders)
                    {
                        if (!csv.HeaderRecord.Contains(header))
                        {
                            return BadRequest(new { message = $"Invalid header: '{header}' is missing in CSV." });
                        }
                    }

                    while (csv.Read())
                    {
                        var name = csv.GetField("Name")?.Trim();
                        var priceString = csv.GetField("Price")?.Trim();
                        var stockString = csv.GetField("Stock")?.Trim();

                        if (string.IsNullOrWhiteSpace(name) ||
                            !decimal.TryParse(priceString, out var priceDecimal) ||
                            !int.TryParse(stockString, out var stock))
                        {
                            continue; // skip invalid row
                        }

                        products.Add(new UpdateProductsDto { Name = name, Price = priceDecimal, Stock = stock });
                    }
                }
                else if (extension == ".xlsx")
                {
                    using var stream = file.OpenReadStream();
                    using var reader = ExcelReaderFactory.CreateReader(stream);

                    bool isFirstRow = true;
                    string[] expectedHeaders = { "Name", "Price", "Stock" };
                    string[] actualHeaders = new string[expectedHeaders.Length];

                    while (reader.Read())
                    {
                        if (isFirstRow)
                        {
                            for (int i = 0; i < expectedHeaders.Length; i++)
                            {
                                actualHeaders[i] = reader.GetValue(i)?.ToString().Trim();
                            }

                            for (int i = 0; i < expectedHeaders.Length; i++)
                            {
                                if (!string.Equals(actualHeaders[i], expectedHeaders[i], StringComparison.OrdinalIgnoreCase))
                                {
                                    return BadRequest(new { message = $"Invalid header '{actualHeaders[i]}'. Expected '{expectedHeaders[i]}'." });
                                }
                            }

                            isFirstRow = false;
                            continue;
                        }

                        var name = reader.GetValue(0)?.ToString().Trim();
                        var priceString = reader.GetValue(1)?.ToString().Trim();
                        var stockString = reader.GetValue(2)?.ToString().Trim();

                        if (string.IsNullOrWhiteSpace(name) ||
                            !decimal.TryParse(priceString, out var priceDecimal) ||
                            !int.TryParse(stockString, out var stock))
                        {
                            continue;
                        }

                        products.Add(new UpdateProductsDto { Name = name, Price = priceDecimal, Stock = stock });
                    }
                }
                else
                {
                    return BadRequest(new { message = "Unsupported file format. Please upload a CSV or Excel (.xlsx) file." });
                }

                var productsToAdd = new List<Product>();

                foreach (var productDto in products)
                {
                    var existingProduct = await _context.Products.FirstOrDefaultAsync(x => x.Name == productDto.Name);
                    if (existingProduct != null)
                    {
                        if (existingProduct.Price == productDto.Price && existingProduct.Stock == productDto.Stock)
                        {
                            duplicateCount++;
                            continue;
                        }

                        await _adminRepo.UpdateProductAsync(existingProduct, productDto);
                        updateCount++;
                    }
                    else
                    {
                        productsToAdd.Add(new Product
                        {
                            Name = productDto.Name,
                            Price = productDto.Price,
                            Stock = productDto.Stock
                        });
                        successfulImports++;
                    }
                }

                if (productsToAdd.Any())
                {
                    await _context.Products.AddRangeAsync(productsToAdd);
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"{successfulImports} out of {products.Count} products imported successfully. Duplicates: {duplicateCount}, Updated: {updateCount}",
                    summary = new
                    {
                        total = products.Count,
                        imported = successfulImports,
                        updated = updateCount,
                        duplicates = duplicateCount
                    }
                });
            }
            catch (Exception ex)
            {
                // Log the exception here if you have logging (recommended)
                return StatusCode(500, new { message = "Internal server error.", error = ex.Message });
            }
        }


        [HttpPost("make/sales/{customerName}/{GrandPrice}")]
        [Authorize]
        public async Task<IActionResult> MakeSales(
            [FromBody] List<CreateSaleDto> saleItems,
            [FromRoute] string customerName,
            [FromRoute] decimal GrandPrice)
        {
            if (saleItems == null || !saleItems.Any())
            {
                return BadRequest(new { message = "No products in the cart." });
            }

            var productIds = saleItems.Select(s => s.ProductId).Distinct().ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            // Validate products
            foreach (var item in saleItems)
            {
                if (!products.ContainsKey(item.ProductId))
                {
                    return BadRequest(new { message = $"Product with ID {item.ProductId} not found." });
                }

                var product = products[item.ProductId];
                if (product.Stock < item.Quantity)
                {
                    return BadRequest(new { message = $"Insufficient stock for Product ID {item.ProductId}." });
                }
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var sale = new Sale
                {
                    AppUserId = userId,
                    CustomerName = customerName,
                    GrandPrice = GrandPrice,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Sales.AddAsync(sale);
                await _context.SaveChangesAsync(); // To get sale.Id

                var saleProducts = new List<SaleProduct>();

                foreach (var item in saleItems)
                {
                    var product = products[item.ProductId];

                    saleProducts.Add(new SaleProduct
                    {
                        SaleId = sale.Id,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        TotalPrice = item.TotalPrice
                    });

                    // Update product stock
                    product.Stock -= item.Quantity;

                    // Manage RecentSales
                    var recentSale = await _context.RecentSales
                        .FirstOrDefaultAsync(rs => rs.ProductID == product.Id);

                    if (recentSale == null)
                    {
                        await _context.RecentSales.AddAsync(new RecentSale { ProductID = product.Id });
                    }
                }

                await _context.SaleProducts.AddRangeAsync(saleProducts);
                await _context.SaveChangesAsync();

                // Maintain only last 10 RecentSales
                var recentSalesCount = await _context.RecentSales.CountAsync();
                if (recentSalesCount > 10)
                {
                    var excessCount = recentSalesCount - 10;
                    var oldestRecentSales = await _context.RecentSales
                        .OrderBy(rs => rs.Id)
                        .Take(excessCount)
                        .ToListAsync();

                    _context.RecentSales.RemoveRange(oldestRecentSales);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                return Ok(new { message = "Sale and SaleProducts created successfully!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpGet("sales/summary")]
        [Authorize]
        public async Task<IActionResult> GetSaleSummary([FromQuery] SalesProductQuery query){
            var sales = await _adminRepo.GetSalesProductItemsAsync(query);
            var totalSales = await _context.Sales.CountAsync();
            var totalQuery = sales.Count;
            var totalPrice = sales.Sum(x=>x.TotalPrice);
            
            var SkipNumber = (query.PageNumber - 1) * query.PageSize;
            var querySales =  sales.Skip(SkipNumber).Take(query.PageSize);

            return StatusCode(200, new{sales=querySales, totalSales=totalSales,totalQuery=totalQuery,totalPrice=totalPrice});
        }

        [HttpGet("sales/visualization/data")]
        [Authorize]
        [Authorize(Policy = "IsAdmin")]
        public async Task<IActionResult> SalesVisualData(){
            var sales = await _context.Sales
            .Select(x=>x.ToListSalesDto())
            .ToListAsync();
            var monthlyTotals = new Dictionary<string, decimal>
            {
                { "January", 0 },
                { "February", 0 },
                { "March", 0 },
                { "April", 0 },
                { "May", 0 },
                { "June", 0 },
                { "July", 0 },
                { "August", 0 },
                { "September", 0 },
                { "October", 0 },
                { "November", 0 },
                { "December", 0 }
            };
            var groupedSales = sales.GroupBy(s => s.CreatedAt.Month)
                .Select(g => new
                {
                    Month = g.Key,
                    Total = g.Sum(s => s.TotalPrice ?? 0)
                }).ToList();
            foreach (var sale in groupedSales)
            {
                // Get the month name by its number (1 = January, 2 = February, etc.)
                var monthName = new DateTime(1, sale.Month, 1).ToString("MMMM");
                
                // Update the monthly total for the corresponding month
                monthlyTotals[monthName] = sale.Total;
            }
            var currentMonth = DateTime.Now.Month;
            var daysInCurrentMonth = DateTime.DaysInMonth(DateTime.Now.Year, currentMonth);
            var dailyTotals = new Dictionary<int, decimal>();
            for (int i = 1; i <= daysInCurrentMonth; i++)
            {
                dailyTotals[i] = 0;
            }
            var dailySales = sales
            .Where(s => s.CreatedAt.Month == currentMonth)
            .GroupBy(s => s.CreatedAt.Day)
            .Select(g => new
            {
                Day = g.Key,
                Total = g.Sum(s => s.TotalPrice ?? 0)
            }).ToList();
            foreach (var sale in dailySales)
            {
                dailyTotals[sale.Day] = sale.Total;
            }
            // Calculate weekly totals for the current month (Week 1, Week 2, etc.)
            var weeklyTotals = new Dictionary<string, decimal>
            {
                { "Week 1", 0 },
                { "Week 2", 0 },
                { "Week 3", 0 },
                { "Week 4", 0 },
                { "Week 5", 0 } // Some months may have 5 weeks
            };

            // Group sales by week of the current month
            var weeklySales = sales
                .Where(s => s.CreatedAt.Month == currentMonth)
                .GroupBy(s => (s.CreatedAt.Day - 1) / 7 + 1)  // Calculate the week number
                .Select(g => new
                {
                    Week = g.Key,  // 1, 2, 3, 4, or 5
                    Total = g.Sum(s => s.TotalPrice ?? 0)
                }).ToList();

            // Update weekly totals with actual sales
            foreach (var sale in weeklySales)
            {
                weeklyTotals[$"Week {sale.Week}"] = sale.Total;
            }

            // Return the result including monthly, daily, and weekly totals
            return StatusCode(200, new
            {
                monthlyTotals = monthlyTotals,
                dailyTotals = dailyTotals,
                weeklyTotals = weeklyTotals
            });
        }

        [HttpGet("sales/details/{id:int}")]
        [Authorize]
        public async Task<IActionResult> SalesDetails([FromRoute] int id){
            var salesDetails = await _adminRepo.GetSalesProductDetailsAsync(id);
            return StatusCode(200, salesDetails);
        }


        [HttpGet("sales")]
        [Authorize]
        public async Task<IActionResult> GetSalesWithProducts()
        {
            var sales = await _context.SaleProducts
                .Include(sp => sp.Sale)
                .ThenInclude(s => s.AppUser)   
                .Include(sp => sp.Product)    
                .GroupBy(sp => new { sp.Sale.Id, sp.Sale.AppUserId })
                .Select(group => new
                {
                    saleId = group.Key.Id,
                    appUserId = group.Key.AppUserId,
                    products = group.Select(sp => new
                    {
                        productId = sp.Product.Id,
                        productName = sp.Product.Name,
                        productPrice = sp.Product.Price,
                        quantity = sp.Quantity
                    }).ToList()
                })
                .ToListAsync();

            return Ok(sales);
        }

        [HttpGet("user/profile")]
        [Authorize]
        // public async Task<IActionResult> GetUserProfile([FromQuery] UserSalesQuery query){
        public async Task<IActionResult> GetUserProfile(){
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userManager.FindByIdAsync(userId);
            // var sales = await _adminRepo.GetUserProfileAsync(query, userId);
            var sales = _context.Sales
            .Where(x=>x.AppUserId == userId);
            var totalSales =await sales.CountAsync();
            var totalPrice =await sales.SumAsync(x=>x.GrandPrice);
            return Ok(new{totalSales=totalSales,totalPrice=totalPrice,Name = user.Name,Username = user.UserName});

        }

        [HttpGet("list/sales/users")]
        [Authorize]
        [Authorize(Policy = "IsAdmin")]
        public async Task<IActionResult> ListUsers()
        {
            var users = await _userManager.Users.Where(x=>x.IsSales == true)
            .Select(x=>x.ToUserDto())
                .ToListAsync();
            return Ok(new {users = users});
        }

        [HttpGet("get/users/list")]
        [Authorize]
        public async Task<IActionResult> GetUserList(){
            var users = await _context.Users
            .Select(x=>x.ToUserDto())
            .ToListAsync();
            return StatusCode(200, users);
        }
    }
            
}






        

