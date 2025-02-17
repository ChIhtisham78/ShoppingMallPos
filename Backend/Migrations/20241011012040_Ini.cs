using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class Ini : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "4bcbc21d-0346-4f0d-8bc8-5466532a85aa");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "eadc2535-e4d7-426d-b6fd-e113225c69cb");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "SaleProducts");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "6068cddc-8943-454c-b8ec-77e5f6971e9d", null, "Admin", "ADMIN" },
                    { "aa030028-300f-4fda-ad1d-52a0a4d3c50d", null, "Sales", "SALES" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "6068cddc-8943-454c-b8ec-77e5f6971e9d");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "aa030028-300f-4fda-ad1d-52a0a4d3c50d");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "SaleProducts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "4bcbc21d-0346-4f0d-8bc8-5466532a85aa", null, "Sales", "SALES" },
                    { "eadc2535-e4d7-426d-b6fd-e113225c69cb", null, "Admin", "ADMIN" }
                });
        }
    }
}
