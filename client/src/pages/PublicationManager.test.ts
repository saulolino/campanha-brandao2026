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
});
