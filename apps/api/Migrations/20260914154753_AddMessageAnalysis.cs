using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SocialOps.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMessageAnalysis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_conversations_SocialAccountId_SocialIdentityId_ExternalConv~",
                table: "conversations");

            migrationBuilder.CreateTable(
                name: "message_analyses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MessageId = table.Column<Guid>(type: "uuid", nullable: false),
                    Intent = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Sentiment = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Risk = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Confidence = table.Column<double>(type: "double precision", nullable: false),
                    Model = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    AnalyzedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_message_analyses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_message_analyses_messages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "messages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_conversations_SocialAccountId",
                table: "conversations",
                column: "SocialAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_message_analyses_MessageId",
                table: "message_analyses",
                column: "MessageId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "message_analyses");

            migrationBuilder.DropIndex(
                name: "IX_conversations_SocialAccountId",
                table: "conversations");

            migrationBuilder.CreateIndex(
                name: "IX_conversations_SocialAccountId_SocialIdentityId_ExternalConv~",
                table: "conversations",
                columns: new[] { "SocialAccountId", "SocialIdentityId", "ExternalConversationId" });
        }
    }
}
