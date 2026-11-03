using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SocialOps.Api.Shared.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMessageDeliveryStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeliveryError",
                table: "messages",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryStatus",
                table: "messages",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "None");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeliveryError",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "DeliveryStatus",
                table: "messages");
        }
    }
}
