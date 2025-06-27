import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Baby, Users, Activity, Gem } from 'lucide-react';

interface SegmentationStats {
  babyAgeStats: Array<{ age_group: string; count: number }>;
  planStats: Array<{ name: string; _count: { users: number } }>;
  engagementStats: Array<{ engagement_level: string; count: number }>;
  motherTypeStats: Array<{ mother_type: string; count: number }>;
}

interface SegmentationTabProps {
  segmentationStats: SegmentationStats;
}

export const SegmentationTab: React.FC<SegmentationTabProps> = ({ segmentationStats }) => {
  if (!segmentationStats) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="w-4 h-4" />
            Idade dos Bebês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {segmentationStats.babyAgeStats.map((stat) => (
              <div key={stat.age_group} className="flex justify-between">
                <span className="text-sm">{stat.age_group}</span>
                <Badge variant="outline">{stat.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Tipo de Mãe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {segmentationStats.motherTypeStats.map((stat) => (
              <div key={stat.mother_type} className="flex justify-between">
                <span className="text-sm">{stat.mother_type}</span>
                <Badge variant="outline">{stat.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Engajamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {segmentationStats.engagementStats.map((stat) => (
              <div key={stat.engagement_level} className="flex justify-between">
                <span className="text-sm">{stat.engagement_level}</span>
                <Badge variant="outline">{stat.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="w-4 h-4" />
            Plano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {segmentationStats.planStats.map((stat) => (
              <div key={stat.name} className="flex justify-between">
                <span className="text-sm">{stat.name}</span>
                <Badge variant="outline">{stat._count.users}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 