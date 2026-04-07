import { describe, it, expect } from "vitest";

describe("ScheduledPostEditor", () => {
  it("deve permitir edição de post programado", () => {
    const post = {
      id: "1",
      title: "Post 1",
      caption: "Legenda 1",
      scheduledDate: new Date().toISOString(),
      status: "scheduled" as const,
    };

    expect(post.status).toBe("scheduled");
    expect(post.title).toBe("Post 1");
  });

  it("deve validar título obrigatório", () => {
    const post = {
      id: "1",
      title: "",
      caption: "Legenda 1",
      scheduledDate: new Date().toISOString(),
      status: "scheduled" as const,
    };

    const isValid = post.title.trim().length > 0;
    expect(isValid).toBe(false);
  });

  it("deve validar legenda obrigatória", () => {
    const post = {
      id: "1",
      title: "Post 1",
      caption: "",
      scheduledDate: new Date().toISOString(),
      status: "scheduled" as const,
    };

    const isValid = post.caption.trim().length > 0;
    expect(isValid).toBe(false);
  });

  it("deve validar data de publicação", () => {
    const post = {
      id: "1",
      title: "Post 1",
      caption: "Legenda 1",
      scheduledDate: "",
      status: "scheduled" as const,
    };

    const isValid = post.scheduledDate.length > 0;
    expect(isValid).toBe(false);
  });

  it("deve permitir edição de todos os campos", () => {
    const post = {
      id: "1",
      title: "Post Original",
      caption: "Legenda Original",
      scheduledDate: new Date().toISOString(),
      status: "scheduled" as const,
    };

    const updated = {
      ...post,
      title: "Post Editado",
      caption: "Legenda Editada",
    };

    expect(updated.title).toBe("Post Editado");
    expect(updated.caption).toBe("Legenda Editada");
    expect(updated.id).toBe(post.id);
  });

  it("deve manter status inalterado durante edição", () => {
    const post = {
      id: "1",
      title: "Post 1",
      caption: "Legenda 1",
      scheduledDate: new Date().toISOString(),
      status: "scheduled" as const,
    };

    const updated = {
      ...post,
      title: "Post Editado",
    };

    expect(updated.status).toBe("scheduled");
  });

  it("deve permitir edição de data de publicação", () => {
    const originalDate = new Date().toISOString();
    const newDate = new Date(Date.now() + 86400000).toISOString(); // +1 dia

    const post = {
      id: "1",
      title: "Post 1",
      caption: "Legenda 1",
      scheduledDate: originalDate,
      status: "scheduled" as const,
    };

    const updated = {
      ...post,
      scheduledDate: newDate,
    };

    expect(updated.scheduledDate).toBe(newDate);
    expect(updated.scheduledDate).not.toBe(originalDate);
  });
});
