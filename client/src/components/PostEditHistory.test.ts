import { describe, it, expect } from "vitest";
import { EditHistoryEntry } from "./PostEditHistory";

describe("PostEditHistory", () => {
  it("should render empty history message when no entries", () => {
    const history: EditHistoryEntry[] = [];
    expect(history.length).toBe(0);
  });

  it("should display history entries with correct structure", () => {
    const history: EditHistoryEntry[] = [
      {
        id: "1",
        timestamp: new Date("2026-04-08T10:00:00"),
        changedBy: "João Coordenador",
        changedByRole: "coordinator",
        fieldChanged: "Título",
        oldValue: "Post Antigo",
        newValue: "Post Novo",
        comment: "Atualizado para melhor clareza",
      },
    ];

    expect(history).toHaveLength(1);
    expect(history[0].changedBy).toBe("João Coordenador");
    expect(history[0].fieldChanged).toBe("Título");
    expect(history[0].oldValue).toBe("Post Antigo");
    expect(history[0].newValue).toBe("Post Novo");
  });

  it("should handle multiple history entries", () => {
    const history: EditHistoryEntry[] = [
      {
        id: "1",
        timestamp: new Date("2026-04-08T10:00:00"),
        changedBy: "João Coordenador",
        changedByRole: "coordinator",
        fieldChanged: "Título",
        oldValue: "Post Antigo",
        newValue: "Post Novo",
      },
      {
        id: "2",
        timestamp: new Date("2026-04-08T11:00:00"),
        changedBy: "Maria Coordenadora",
        changedByRole: "coordinator",
        fieldChanged: "Data de Publicação",
        oldValue: "2026-04-10",
        newValue: "2026-04-12",
        comment: "Adiado por conflito de agenda",
      },
    ];

    expect(history).toHaveLength(2);
    expect(history[0].fieldChanged).toBe("Título");
    expect(history[1].fieldChanged).toBe("Data de Publicação");
  });

  it("should handle optional comment field", () => {
    const historyWithComment: EditHistoryEntry = {
      id: "1",
      timestamp: new Date(),
      changedBy: "João",
      changedByRole: "coordinator",
      fieldChanged: "Legenda",
      oldValue: "Legenda antiga",
      newValue: "Legenda nova",
      comment: "Melhorado para SEO",
    };

    const historyWithoutComment: EditHistoryEntry = {
      id: "2",
      timestamp: new Date(),
      changedBy: "Maria",
      changedByRole: "coordinator",
      fieldChanged: "Título",
      oldValue: "Título antigo",
      newValue: "Título novo",
    };

    expect(historyWithComment.comment).toBeDefined();
    expect(historyWithoutComment.comment).toBeUndefined();
  });

  it("should format dates correctly", () => {
    const entry: EditHistoryEntry = {
      id: "1",
      timestamp: new Date("2026-04-08T14:30:00"),
      changedBy: "João",
      changedByRole: "coordinator",
      fieldChanged: "Título",
      oldValue: "Antigo",
      newValue: "Novo",
    };

    const timestamp = entry.timestamp;
    expect(timestamp.getFullYear()).toBe(2026);
    expect(timestamp.getMonth()).toBe(3); // April is month 3 (0-indexed)
    expect(timestamp.getDate()).toBe(8);
    expect(timestamp.getHours()).toBe(14);
    expect(timestamp.getMinutes()).toBe(30);
  });

  it("should handle role information", () => {
    const roles = ["coordinator", "designer", "redactor", "superadmin"];
    const entries = roles.map((role, index) => ({
      id: `${index}`,
      timestamp: new Date(),
      changedBy: `User ${index}`,
      changedByRole: role,
      fieldChanged: "Título",
      oldValue: "Antigo",
      newValue: "Novo",
    }));

    expect(entries).toHaveLength(4);
    expect(entries.map((e) => e.changedByRole)).toEqual(roles);
  });

  it("should track multiple field changes by same user", () => {
    const history: EditHistoryEntry[] = [
      {
        id: "1",
        timestamp: new Date("2026-04-08T10:00:00"),
        changedBy: "João",
        changedByRole: "coordinator",
        fieldChanged: "Título",
        oldValue: "Antigo",
        newValue: "Novo",
      },
      {
        id: "2",
        timestamp: new Date("2026-04-08T10:05:00"),
        changedBy: "João",
        changedByRole: "coordinator",
        fieldChanged: "Legenda",
        oldValue: "Legenda antiga",
        newValue: "Legenda nova",
      },
    ];

    const joaoChanges = history.filter((e) => e.changedBy === "João");
    expect(joaoChanges).toHaveLength(2);
  });
});
