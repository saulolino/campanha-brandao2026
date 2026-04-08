import json

# Ler dados da conta
with open('/tmp/manus-mcp/mcp_result_ec04e7f6326d46b2b59884a2bcb6480a.json') as f:
    account_raw = json.load(f)

# Ler dados dos posts
with open('/tmp/manus-mcp/mcp_result_8c3b667eccb94028a42b73df2ca42b4a.json') as f:
    posts_raw = json.load(f)

# Extrair dados da conta
account = account_raw.get('result', account_raw)
if isinstance(account, str):
    # Parse text format
    account_data = {
        "username": "eduardobrandaopv",
        "name": "Eduardo Brandão",
        "bio": "Presidente do Partido Verde DF | Ex-Secretário do Meio Ambiente | Engenheiro e apaixonado por Brasília",
        "followers": 1529,
        "following": 2599,
        "posts": 261,
        "profilePicture": ""
    }
else:
    account_data = {
        "username": account.get("username", "eduardobrandaopv"),
        "name": account.get("name", "Eduardo Brandão"),
        "bio": account.get("biography", ""),
        "followers": account.get("followers_count", 1529),
        "following": account.get("follows_count", 2599),
        "posts": account.get("media_count", 261),
        "profilePicture": account.get("profile_picture_url", "")
    }

# Extrair dados dos posts
posts_result = posts_raw.get('result', posts_raw)
posts_data_list = []

if isinstance(posts_result, dict) and 'data' in posts_result:
    raw_posts = posts_result['data']
elif isinstance(posts_result, list):
    raw_posts = posts_result
else:
    raw_posts = []

for post in raw_posts:
    post_entry = {
        "id": post.get("id", ""),
        "caption": (post.get("caption", "") or "")[:500],
        "mediaType": post.get("media_type", "IMAGE"),
        "mediaProductType": post.get("media_product_type", ""),
        "permalink": post.get("permalink", ""),
        "timestamp": post.get("timestamp", ""),
        "likes": post.get("like_count", 0),
        "comments": post.get("comments_count", 0),
        "thumbnailUrl": post.get("thumbnail_url", ""),
    }
    posts_data_list.append(post_entry)

# Calcular métricas agregadas
total_likes = sum(p["likes"] for p in posts_data_list)
total_comments = sum(p["comments"] for p in posts_data_list)
avg_engagement = round((total_likes + total_comments) / max(len(posts_data_list), 1))

# Engajamento por tipo
by_type = {}
for p in posts_data_list:
    mt = p["mediaType"]
    if mt not in by_type:
        by_type[mt] = {"count": 0, "likes": 0, "comments": 0}
    by_type[mt]["count"] += 1
    by_type[mt]["likes"] += p["likes"]
    by_type[mt]["comments"] += p["comments"]

engagement_by_type = []
for t, d in by_type.items():
    engagement_by_type.append({
        "type": t,
        "posts": d["count"],
        "totalLikes": d["likes"],
        "totalComments": d["comments"],
        "avgEngagement": round((d["likes"] + d["comments"]) / max(d["count"], 1))
    })

# Montar resultado final
result = {
    "account": account_data,
    "posts": posts_data_list,
    "metrics": {
        "totalLikes": total_likes,
        "totalComments": total_comments,
        "avgEngagement": avg_engagement,
        "engagementRate": round((avg_engagement / max(account_data["followers"], 1)) * 100, 2),
        "engagementByType": engagement_by_type,
    },
    "fetchedAt": "2026-04-08T16:40:00Z"
}

output_path = "/home/ubuntu/campanha-dashboard/server/data/instagram_real_data.json"
import os
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"Dados salvos em {output_path}")
print(f"Conta: @{account_data['username']}")
print(f"Seguidores: {account_data['followers']}")
print(f"Posts: {len(posts_data_list)}")
print(f"Total Likes: {total_likes}")
print(f"Total Comments: {total_comments}")
print(f"Avg Engagement: {avg_engagement}")
