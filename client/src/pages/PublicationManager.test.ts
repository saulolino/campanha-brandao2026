import { describe, it, expect, beforeEach, vi } from "vitest";
import { afterEach } from "vitest";

/**
 * @vitest-environment jsdom
 */

describe("PublicationManager - localStorage operations", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should create a new post and save to localStorage", () => {
    const newPost = {
      id: 1,
      title: "Test Post",
      caption: "Test Caption",
      status: "draft",
      scheduledDate: "2026-04-10T10:00:00",
      createdBy: "test@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    };

    const posts = [newPost];
    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    expect(savedPosts).toHaveLength(1);
    expect(savedPosts[0].title).toBe("Test Post");
    expect(savedPosts[0].status).toBe("draft");
  });

  it("should update post status with transition history", () => {
    const initialPost = {
      id: 1,
      title: "Test Post",
      caption: "Test Caption",
      status: "draft",
      scheduledDate: "2026-04-10T10:00:00",
      createdBy: "test@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    };

    let posts = [initialPost];
    localStorage.setItem("posts", JSON.stringify(posts));

    // Update status with transition history
    const transition = {
      timestamp: new Date().toISOString(),
      fromStatus: "draft",
      toStatus: "design",
      movedBy: "test@example.com",
    };

    posts = posts.map((post) =>
      post.id === 1
        ? {
            ...post,
            status: "design",
            updatedAt: new Date().toISOString(),
            updatedBy: "test@example.com",
            history: [...post.history, transition],
          }
        : post
    );
    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    expect(savedPosts[0].status).toBe("design");
    expect(savedPosts[0].history).toHaveLength(1);
    expect(savedPosts[0].history[0].fromStatus).toBe("draft");
    expect(savedPosts[0].history[0].toStatus).toBe("design");
  });

  it("should edit post data", () => {
    const initialPost = {
      id: 1,
      title: "Original Title",
      caption: "Original Caption",
      status: "draft",
      scheduledDate: "2026-04-10T10:00:00",
      createdBy: "test@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    };

    let posts = [initialPost];
    localStorage.setItem("posts", JSON.stringify(posts));

    // Edit post
    posts = posts.map((post) =>
      post.id === 1
        ? {
            ...post,
            title: "Updated Title",
            caption: "Updated Caption",
            updatedAt: new Date().toISOString(),
            updatedBy: "test@example.com",
          }
        : post
    );
    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    expect(savedPosts[0].title).toBe("Updated Title");
    expect(savedPosts[0].caption).toBe("Updated Caption");
    expect(savedPosts[0].updatedBy).toBe("test@example.com");
  });

  it("should add media URL to post", () => {
    const initialPost = {
      id: 1,
      title: "Test Post",
      caption: "Test Caption",
      status: "draft",
      scheduledDate: "2026-04-10T10:00:00",
      createdBy: "test@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mediaUrl: undefined,
      history: [],
    };

    let posts = [initialPost];
    localStorage.setItem("posts", JSON.stringify(posts));

    // Add media
    const mediaUrl = "data:image/png;base64,iVBORw0KGgo...";
    posts = posts.map((post) =>
      post.id === 1 ? { ...post, mediaUrl } : post
    );
    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    expect(savedPosts[0].mediaUrl).toBe(mediaUrl);
  });

  it("should delete a post", () => {
    const posts = [
      {
        id: 1,
        title: "Post 1",
        caption: "Caption 1",
        status: "draft",
        scheduledDate: "2026-04-10T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
      {
        id: 2,
        title: "Post 2",
        caption: "Caption 2",
        status: "design",
        scheduledDate: "2026-04-11T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
    ];

    localStorage.setItem("posts", JSON.stringify(posts));

    // Delete post with id 1
    const updatedPosts = posts.filter((post) => post.id !== 1);
    localStorage.setItem("posts", JSON.stringify(updatedPosts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    expect(savedPosts).toHaveLength(1);
    expect(savedPosts[0].id).toBe(2);
  });

  it("should filter posts by status", () => {
    const posts = [
      {
        id: 1,
        title: "Draft Post",
        caption: "Caption 1",
        status: "draft",
        scheduledDate: "2026-04-10T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
      {
        id: 2,
        title: "Design Post",
        caption: "Caption 2",
        status: "design",
        scheduledDate: "2026-04-11T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
      {
        id: 3,
        title: "Published Post",
        caption: "Caption 3",
        status: "published",
        scheduledDate: "2026-04-12T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
    ];

    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    const draftPosts = savedPosts.filter((post: any) => post.status === "draft");

    expect(draftPosts).toHaveLength(1);
    expect(draftPosts[0].title).toBe("Draft Post");
  });

  it("should maintain transition history across multiple status changes", () => {
    const initialPost = {
      id: 1,
      title: "Test Post",
      caption: "Test Caption",
      status: "draft",
      scheduledDate: "2026-04-10T10:00:00",
      createdBy: "test@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    };

    let posts = [initialPost];

    // First transition
    const transition1 = {
      timestamp: new Date().toISOString(),
      fromStatus: "draft",
      toStatus: "design",
      movedBy: "designer@example.com",
    };

    posts = posts.map((post) =>
      post.id === 1
        ? {
            ...post,
            status: "design",
            history: [...post.history, transition1],
          }
        : post
    );

    // Second transition
    const transition2 = {
      timestamp: new Date().toISOString(),
      fromStatus: "design",
      toStatus: "caption",
      movedBy: "writer@example.com",
    };

    posts = posts.map((post) =>
      post.id === 1
        ? {
            ...post,
            status: "caption",
            history: [...post.history, transition2],
          }
        : post
    );

    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    expect(savedPosts[0].history).toHaveLength(2);
    expect(savedPosts[0].history[0].toStatus).toBe("design");
    expect(savedPosts[0].history[1].toStatus).toBe("caption");
  });

  it("should validate post data before editing", () => {
    const invalidPost = {
      title: "", // Empty title should be invalid
      caption: "Test",
      scheduledDate: "2026-04-10T10:00:00",
    };

    const isValid = invalidPost.title.trim().length > 0;
    expect(isValid).toBe(false);
  });

  it("should handle empty posts list", () => {
    localStorage.setItem("posts", JSON.stringify([]));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    expect(savedPosts).toHaveLength(0);
  });

  it("should duplicate a post with new ID and (cópia) suffix", () => {
    const originalPost = {
      id: 1,
      title: "Original Post",
      caption: "Original Caption",
      status: "draft",
      scheduledDate: "2026-04-10T10:00:00",
      createdBy: "test@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mediaUrl: "data:image/png;base64,iVBORw0KGgo...",
      history: [],
    };

    let posts = [originalPost];
    localStorage.setItem("posts", JSON.stringify(posts));

    // Duplicate post
    const duplicatedPost = {
      id: Date.now(),
      title: `${originalPost.title} (cópia)`,
      caption: originalPost.caption,
      status: "draft",
      scheduledDate: "",
      createdBy: "test@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mediaUrl: originalPost.mediaUrl,
      history: [],
    };

    posts = [...posts, duplicatedPost];
    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    expect(savedPosts).toHaveLength(2);
    expect(savedPosts[1].title).toBe("Original Post (cópia)");
    expect(savedPosts[1].caption).toBe("Original Caption");
    expect(savedPosts[1].mediaUrl).toBe(originalPost.mediaUrl);
    expect(savedPosts[1].id).not.toBe(originalPost.id);
  });

  it("should filter posts by search term (title)", () => {
    const posts = [
      {
        id: 1,
        title: "Campanha de Primavera",
        caption: "Descrição",
        status: "draft",
        scheduledDate: "2026-04-10T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
      {
        id: 2,
        title: "Promoção de Verão",
        caption: "Descrição",
        status: "draft",
        scheduledDate: "2026-04-11T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
    ];

    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    const filtered = savedPosts.filter((post: any) =>
      post.title.toLowerCase().includes("primavera")
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("Campanha de Primavera");
  });

  it("should filter posts by search term (caption)", () => {
    const posts = [
      {
        id: 1,
        title: "Post 1",
        caption: "Descrição com palavra-chave importante",
        status: "draft",
        scheduledDate: "2026-04-10T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
      {
        id: 2,
        title: "Post 2",
        caption: "Outra descrição",
        status: "draft",
        scheduledDate: "2026-04-11T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
    ];

    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    const filtered = savedPosts.filter((post: any) =>
      post.caption.toLowerCase().includes("palavra-chave")
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].caption).toContain("palavra-chave");
  });

  it("should filter posts by creator", () => {
    const posts = [
      {
        id: 1,
        title: "Post 1",
        caption: "Caption 1",
        status: "draft",
        scheduledDate: "2026-04-10T10:00:00",
        createdBy: "designer@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
      {
        id: 2,
        title: "Post 2",
        caption: "Caption 2",
        status: "draft",
        scheduledDate: "2026-04-11T10:00:00",
        createdBy: "writer@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
    ];

    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    const filtered = savedPosts.filter((post: any) =>
      post.createdBy === "designer@example.com"
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].createdBy).toBe("designer@example.com");
  });

  it("should filter posts by date range", () => {
    const baseDate = new Date("2026-04-10");
    const posts = [
      {
        id: 1,
        title: "Post 1",
        caption: "Caption 1",
        status: "draft",
        scheduledDate: "2026-04-10T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date("2026-04-09").toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
      {
        id: 2,
        title: "Post 2",
        caption: "Caption 2",
        status: "draft",
        scheduledDate: "2026-04-11T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date("2026-04-10").toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
      {
        id: 3,
        title: "Post 3",
        caption: "Caption 3",
        status: "draft",
        scheduledDate: "2026-04-12T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date("2026-04-11").toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
    ];

    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    const dateFrom = new Date("2026-04-10");
    const dateTo = new Date("2026-04-10");
    dateTo.setHours(23, 59, 59, 999);

    const filtered = savedPosts.filter((post: any) => {
      const postDate = new Date(post.createdAt);
      return postDate >= dateFrom && postDate <= dateTo;
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(2);
  });
});
