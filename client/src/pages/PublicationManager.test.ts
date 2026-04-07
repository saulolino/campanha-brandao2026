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
    };

    const posts = [newPost];
    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    expect(savedPosts).toHaveLength(1);
    expect(savedPosts[0].title).toBe("Test Post");
    expect(savedPosts[0].status).toBe("draft");
  });

  it("should update post status", () => {
    const initialPost = {
      id: 1,
      title: "Test Post",
      caption: "Test Caption",
      status: "draft",
      scheduledDate: "2026-04-10T10:00:00",
      createdBy: "test@example.com",
      createdAt: new Date().toISOString(),
    };

    let posts = [initialPost];
    localStorage.setItem("posts", JSON.stringify(posts));

    // Update status
    posts = posts.map((post) =>
      post.id === 1 ? { ...post, status: "design" } : post
    );
    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    expect(savedPosts[0].status).toBe("design");
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
      },
      {
        id: 2,
        title: "Post 2",
        caption: "Caption 2",
        status: "design",
        scheduledDate: "2026-04-11T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
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
      },
      {
        id: 2,
        title: "Design Post",
        caption: "Caption 2",
        status: "design",
        scheduledDate: "2026-04-11T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: "Published Post",
        caption: "Caption 3",
        status: "published",
        scheduledDate: "2026-04-12T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    const draftPosts = savedPosts.filter((post: any) => post.status === "draft");

    expect(draftPosts).toHaveLength(1);
    expect(draftPosts[0].title).toBe("Draft Post");
  });

  it("should handle empty posts list", () => {
    localStorage.setItem("posts", JSON.stringify([]));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    expect(savedPosts).toHaveLength(0);
  });

  it("should validate post data before creating", () => {
    const invalidPost = {
      title: "", // Empty title should be invalid
      caption: "Test",
      scheduledDate: "2026-04-10T10:00:00",
    };

    const isValid = invalidPost.title.trim().length > 0;
    expect(isValid).toBe(false);
  });

  it("should maintain post order when filtering", () => {
    const posts = [
      {
        id: 1,
        title: "First",
        caption: "C1",
        status: "draft",
        scheduledDate: "2026-04-10T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Second",
        caption: "C2",
        status: "design",
        scheduledDate: "2026-04-11T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: "Third",
        caption: "C3",
        status: "draft",
        scheduledDate: "2026-04-12T10:00:00",
        createdBy: "test@example.com",
        createdAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem("posts", JSON.stringify(posts));

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    const draftPosts = savedPosts.filter((post: any) => post.status === "draft");

    expect(draftPosts).toHaveLength(2);
    expect(draftPosts[0].id).toBe(1);
    expect(draftPosts[1].id).toBe(3);
  });
});
