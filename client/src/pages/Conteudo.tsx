import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Video, Image, MessageSquare, Heart, MessageCircle, Share2, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { InstagramErrorAlert } from "@/components/InstagramErrorAlert";

export default function Conteudo() {
  const { animationClass } = usePageTransition();
  
  // Buscar posts reais do Instagram
  const { data: posts, isLoading: postsLoading, error: postsError } = trpc.instagram.getPosts.useQuery({ limit: 20 });
  const { data: topPosts, isLoading: topLoading, error: topError } = trpc.instagram.getTopPosts.useQuery({ limit: 10 });

  const getTypeIcon = (type: string) => {
    const typeStr = type?.toLowerCase() || '';
    if (typeStr.includes('reel')) return <Video className="w-4 h-4" />;
    if (typeStr.includes('carousel')) return <Image className="w-4 h-4" />;
    if (typeStr.includes('story')) return <MessageSquare className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  const getTypeLabel = (type: string) => {
    const typeStr = type?.toLowerCase() || '';
    if (typeStr.includes('reel')) return 'Reel';
    if (typeStr.includes('carousel')) return 'Carrossel';
    if (typeStr.includes('story')) return 'Story';
    if (typeStr.includes('image')) return 'Imagem';
    if (typeStr.includes('video')) return 'Vídeo';
    return type || 'Conteúdo';
  };

  // Contar tipos de conteúdo
  const contentTypeCounts = posts?.reduce((acc: any, post: any) => {
    const type = getTypeLabel(post.mediaType);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="conteudo" />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-6xl mx-auto">
          {/* Error Alert */}
          {(postsError || topError) && <InstagramErrorAlert error={(postsError || topError) as unknown as Error} />}
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Conteúdo</h1>
            </div>
            <p className="text-muted-foreground">Posts recentes e performance de conteúdo do Instagram</p>
          </div>

          {/* Estatísticas de Conteúdo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{posts?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Últimos 20 posts</p>
              </CardContent>
            </Card>

            {Object.entries(contentTypeCounts).map(([type, count]: [string, any]) => (
              <Card key={type} className="border border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {getTypeIcon(type)}
                    {type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{count}</div>
                  <p className="text-xs text-muted-foreground mt-1">Posts</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="timeline">Timeline de Posts</TabsTrigger>
              <TabsTrigger value="topPosts">Top Posts</TabsTrigger>
            </TabsList>

            {/* Timeline de Posts */}
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Posts Recentes</CardTitle>
                  <CardDescription>Últimos 20 posts publicados no Instagram</CardDescription>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : posts && posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post: any, index: number) => (
                        <div key={post.id || index} className="border border-border/50 rounded-lg p-4 hover:border-primary/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getTypeIcon(post.mediaType)}
                                <Badge variant="secondary">{getTypeLabel(post.mediaType)}</Badge>
                              </div>
                              <h4 className="font-semibold line-clamp-2">{post.caption || 'Sem legenda'}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(post.timestamp).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            {post.mediaUrl && (
                              <img 
                                src={post.mediaUrl} 
                                alt="Post" 
                                className="w-20 h-20 rounded-lg object-cover ml-4"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/30">
                            <div className="flex items-center gap-2 text-sm">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span>{post.likes?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MessageCircle className="w-4 h-4 text-blue-500" />
                              <span>{post.comments?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Share2 className="w-4 h-4 text-green-500" />
                              <span>{post.reach?.toLocaleString() || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Nenhum post encontrado. Verifique as credenciais do Instagram.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Posts */}
            <TabsContent value="topPosts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Posts por Engajamento</CardTitle>
                  <CardDescription>Posts com melhor performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {topLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : topPosts && topPosts.length > 0 ? (
                    <div className="space-y-4">
                      {topPosts.map((post: any, index: number) => (
                        <div key={post.id || index} className="border border-border/50 rounded-lg p-4 bg-accent/5 hover:border-primary/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getTypeIcon(post.mediaType)}
                                <Badge variant="default">{getTypeLabel(post.mediaType)}</Badge>
                                <Badge variant="outline">#{index + 1}</Badge>
                              </div>
                              <h4 className="font-semibold line-clamp-2">{post.caption || 'Sem legenda'}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(post.timestamp).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            {post.mediaUrl && (
                              <img 
                                src={post.mediaUrl} 
                                alt="Post" 
                                className="w-20 h-20 rounded-lg object-cover ml-4"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-4 pt-3 border-t border-border/30">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Engajamento</p>
                              <p className="font-semibold text-primary">{post.engagement?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Curtidas</p>
                              <p className="font-semibold text-red-500">{post.likes?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Comentários</p>
                              <p className="font-semibold text-blue-500">{post.comments?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Alcance</p>
                              <p className="font-semibold text-green-500">{post.reach?.toLocaleString() || 0}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Nenhum post encontrado. Verifique as credenciais do Instagram.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
