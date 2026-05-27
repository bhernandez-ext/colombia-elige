import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const { game_id } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("game_id", game_id)
    .eq("is_human", true);

  const allDone = players?.every((p) => p.turn_done);
  if (!allDone) {
    return new Response("not all done", { status: 200, headers: CORS });
  }

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", game_id)
    .single();

  if (!game) {
    return new Response("game not found", { status: 404, headers: CORS });
  }

  const { data: actions } = await supabase
    .from("actions")
    .select("*")
    .eq("game_id", game_id)
    .eq("turn", game.turn)
    .order("created_at");

  const { data: groups } = await supabase
    .from("game_groups")
    .select("*")
    .eq("game_id", game_id);

  const groupMap: Record<string, any> = {};
  groups?.forEach((g) => {
    groupMap[`${g.dept_id}:${g.group_idx}`] = { ...g };
  });

  const playerMap: Record<string, any> = {};
  players?.forEach((p) => {
    playerMap[p.id] = { ...p };
  });

  const sorted = (actions || []).sort((a, b) => {
    const order: Record<string, number> = {
      activate: 0,
      reinforce: 1,
      concession: 2,
      attack: 3,
    };
    return (order[a.action_type] ?? 9) - (order[b.action_type] ?? 9);
  });

  const results: Array<{ id: string; result: string }> = [];

  for (const action of sorted) {
    const key = `${action.dept_id}:${action.group_idx}`;
    const group = groupMap[key] || { owner_cand: null, reinforced: false };
    const player = playerMap[action.player_id];
    if (!player) continue;

    let result = "fail";

    if (action.action_type === "activate" && !group.owner_cand) {
      group.owner_cand = player.candidate_id;
      result = "success";
    } else if (
      action.action_type === "reinforce" &&
      group.owner_cand === player.candidate_id
    ) {
      group.reinforced = true;
      result = "success";
    } else if (
      action.action_type === "attack" &&
      group.owner_cand &&
      group.owner_cand !== player.candidate_id
    ) {
      const chance = group.reinforced ? 0.3 : 0.6;
      if (Math.random() < chance) {
        group.owner_cand = player.candidate_id;
        group.reinforced = false;
        result = "success";
      }
    } else if (action.action_type === "concession" && !group.owner_cand) {
      group.owner_cand = player.candidate_id;
      result = "success";
    }

    groupMap[key] = group;
    results.push({ id: action.id, result });
  }

  const upserts = Object.entries(groupMap).map(([key, group]) => {
    const [dept_id, group_idx] = key.split(":");
    return { game_id, dept_id, group_idx: parseInt(group_idx, 10), ...group };
  });

  if (upserts.length > 0) {
    await supabase.from("game_groups").upsert(upserts);
  }

  for (const r of results) {
    await supabase.from("actions").update({ result: r.result }).eq("id", r.id);
  }

  // Reset AI players' turn_done so next call's allDone check stays human-only safe
  const nextTurn = game.turn + 1;
  await supabase.from("games").update({ turn: nextTurn }).eq("id", game_id);
  await supabase
    .from("players")
    .update({ turn_done: false })
    .eq("game_id", game_id)
    .eq("is_human", true);

  return new Response(JSON.stringify({ ok: true, turn: nextTurn }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
