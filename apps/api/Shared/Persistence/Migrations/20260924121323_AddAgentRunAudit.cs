using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SocialOps.Api.Shared.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAgentRunAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "agent_runs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    InputMessageId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Model = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    FinalReply = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: true),
                    Error = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agent_runs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "agent_tool_executions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AgentRunId = table.Column<Guid>(type: "uuid", nullable: false),
                    ToolName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ArgumentsJson = table.Column<string>(type: "text", nullable: false),
                    ResultJson = table.Column<string>(type: "text", nullable: true),
                    Success = table.Column<bool>(type: "boolean", nullable: false),
                    Error = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agent_tool_executions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_agent_tool_executions_agent_runs_AgentRunId",
                        column: x => x.AgentRunId,
                        principalTable: "agent_runs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_agent_runs_ConversationId_StartedAt",
                table: "agent_runs",
                columns: new[] { "ConversationId", "StartedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_agent_tool_executions_AgentRunId",
                table: "agent_tool_executions",
                column: "AgentRunId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "agent_tool_executions");

            migrationBuilder.DropTable(
                name: "agent_runs");
        }
    }
}
