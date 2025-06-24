import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shop } from "./Shop";
// Os componentes abaixo serão criados como esqueleto
// import { DailyMissions } from "./DailyMissions";
// import { SpecialEvents } from "./SpecialEvents";
// import { PurchaseHistory } from "./PurchaseHistory";

export const RewardsTabs = ({ userPoints }: { userPoints: number }) => {
  const [tab, setTab] = useState("shop");

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="mb-6 w-full flex flex-wrap gap-2">
        <TabsTrigger value="shop">Loja de Recompensas</TabsTrigger>
        <TabsTrigger value="missions">Missões Diárias</TabsTrigger>
        <TabsTrigger value="events">Eventos Especiais</TabsTrigger>
        <TabsTrigger value="history">Histórico de Compras</TabsTrigger>
      </TabsList>
      <TabsContent value="shop">
        <Shop userPoints={userPoints} />
      </TabsContent>
      <TabsContent value="missions">
        {/* <DailyMissions /> */}
        <div className="text-center text-muted-foreground py-8">Missões Diárias (em breve)</div>
      </TabsContent>
      <TabsContent value="events">
        {/* <SpecialEvents /> */}
        <div className="text-center text-muted-foreground py-8">Eventos Especiais (em breve)</div>
      </TabsContent>
      <TabsContent value="history">
        {/* <PurchaseHistory /> */}
        <div className="text-center text-muted-foreground py-8">Histórico de Compras (em breve)</div>
      </TabsContent>
    </Tabs>
  );
}; 