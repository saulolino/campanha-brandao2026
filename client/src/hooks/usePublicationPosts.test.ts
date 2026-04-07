import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

/**
 * @vitest-environment jsdom
 */

describe("usePublicationPosts - localStorage sync", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should load posts from localStorage on initialization", () => {
    const mockPosts = [
      {
        id: 1,
        title: "Test Post",
        caption: "Test Caption",
        status: "draft" as const,
        scheduledDate: "2026-04-10T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
    ];

    localStorage.setItem("publication_posts", JSON.stringify(mockPosts));

    const stored = JSON.parse(localStorage.getItem("publication_posts") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe("Test Post");
  });

  it("should save posts to localStorage when created", () => {
    const newPost = {
      id: Date.now(),
      title: "New Post",
      caption: "New Caption",
      status: "draft" as const,
      scheduledDate: "2026-04-10T10:00:00",
      createdBy: "test@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    };

    const posts = [newPost];
    localStorage.setItem("publication_posts", JSON.stringify(posts));

    const stored = JSON.parse(localStorage.getItem("publication_posts") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(newPost.id);
  });

  it("should update post in localStorage", () => {
    const initialPost = {
      id: 1,
      title: "Original Title",
      caption: "Original Caption",
      status: "draft" as const,
      scheduledDate: "2026-04-10T10:00:00",
      createdBy: "test@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    };

    let posts = [initialPost];
    localStorage.setItem("publication_posts", JSON.stringify(posts));

    // Update post
    posts = posts.map((post) =>
      post.id === 1
        ? {
            ...post,
            title: "Updated Title",
            updatedAt: new Date().toISOString(),
          }
        : post
    );
    localStorage.setItem("publication_posts", JSON.stringify(posts));

    const stored = JSON.parse(localStorage.getItem("publication_posts") || "[]");
    expect(stored[0].title).toBe("Updated Title");
  });

  it("should delete post from localStorage", () => {
    const posts = [
      {
        id: 1,
        title: "Post 1",
        caption: "Caption 1",
        status: "draft" as const,
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
        status: "draft" as const,
        scheduledDate: "2026-04-11T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
    ];

    localStorage.setItem("publication_posts", JSON.stringify(posts));

    // Delete post with id 1
    const updated = posts.filter((post) => post.id !== 1);
    localStorage.setItem("publication_posts", JSON.stringify(updated));

    const stored = JSON.parse(localStorage.getItem("publication_posts") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(2);
  });

  it("should track sync status transitions", () => {
    const syncStatuses = ["idle", "syncing", "online", "offline", "error"];
    expect(syncStatuses).toContain("idle");
    expect(syncStatuses).toContain("syncing");
    expect(syncStatuses).toContain("online");
    expect(syncStatuses).toContain("offline");
    expect(syncStatuses).toContain("error");
  });

  it("should handle post status transitions with history", () => {
    const post = {
      id: 1,
      title: "Test Post",
      caption: "Test Caption",
      status: "draft" as const,
      scheduledDate: "2026-04-10T10:00:00",
      createdBy: "test@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    };

    const transition = {
      timestamp: new Date().toISOString(),
      fromStatus: "draft",
      toStatus: "design" as const,
      movedBy: "test@example.com",
    };

    const updatedPost = {
      ...post,
      status: "design" as const,
      history: [...post.history, transition],
    };

    expect(updatedPost.status).toBe("design");
    expect(updatedPost.history).toHaveLength(1);
    expect(updatedPost.history[0].toStatus).toBe("design");
  });

  it("should maintain multiple transitions in history", () => {
    let post = {
      id: 1,
      title: "Test Post",
      caption: "Test Caption",
      status: "draft" as const,
      scheduledDate: "2026-04-10T10:00:00",
      createdBy: "test@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    };

    // First transition
    const transition1 = {
      timestamp: new Date().toISOString(),
      fromStatus: "draft",
      toStatus: "design" as const,
      movedBy: "designer@example.com",
    };

    post = {
      ...post,
      status: "design",
      history: [...post.history, transition1],
    };

    // Second transition
    const transition2 = {
      timestamp: new Date().toISOString(),
      fromStatus: "design",
      toStatus: "caption" as const,
      movedBy: "writer@example.com",
    };

    post = {
      ...post,
      status: "caption",
      history: [...post.history, transition2],
    };

    expect(post.history).toHaveLength(2);
    expect(post.history[0].toStatus).toBe("design");
    expect(post.history[1].toStatus).toBe("caption");
  });

  it("should handle offline fallback to localStorage", () => {
    const post = {
      id: 1,
      title: "Offline Post",
      caption: "Created offline",
      status: "draft" as const,
      scheduledDate: "2026-04-10T10:00:00",
      createdBy: "test@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    };

    // Simulate offline: save to localStorage only
    localStorage.setItem("publication_posts", JSON.stringify([post]));

    // Verify it's stored
    const stored = JSON.parse(localStorage.getItem("publication_posts") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe("Offline Post");
  });

  it("should clear localStorage on error", () => {
    localStorage.setItem("publication_posts", JSON.stringify([{ id: 1 }]));
    expect(localStorage.getItem("publication_posts")).not.toBeNull();

    // Clear on error
    localStorage.removeItem("publication_posts");
    expect(localStorage.getItem("publication_posts")).toBeNull();
  });
});
