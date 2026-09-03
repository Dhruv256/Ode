"use client";
import { Reorder, useDragControls } from "framer-motion";
import type { HamperItem } from "../types";
import { HAMPER_ITEM_REGISTRY } from "../config";
import { ItemIcon } from "../components/ItemIcon";
import { itemSummary } from "../recipient/ItemView";
import styles from "../hamper.module.css";
export function ArrangeItems({ items, onChange, onEdit }: { items: HamperItem[]; onChange: (items: HamperItem[]) => void; onEdit: (item: HamperItem) => void }) {
  const reorder = (ids: string[]) => onChange(ids.map((id, position) => ({ ...items.find(i => i.id === id)!, position })));
  return <Reorder.Group axis="y" values={items.map(i => i.id)} onReorder={reorder} className={styles.itemList} aria-label="Inside your hamper">
    {items.map((item, i) => <ArrangeRow key={item.id} item={item} index={i} count={items.length} onEdit={() => onEdit(item)} onRemove={() => onChange(items.filter(x => x.id !== item.id).map((x, position) => ({ ...x, position })))} onMove={direction => { const next = items.map(x => x.id); [next[i], next[i + direction]] = [next[i + direction], next[i]]; reorder(next); }} />)}
  </Reorder.Group>;
}
function ArrangeRow({ item, index, count, onEdit, onRemove, onMove }: { item: HamperItem; index: number; count: number; onEdit: () => void; onRemove: () => void; onMove: (direction: -1 | 1) => void }) {
  const drag = useDragControls();
  return <Reorder.Item value={item.id} dragListener={false} dragControls={drag} className={styles.itemRow}>
    <button type="button" className={styles.dragHandle} aria-label={`Drag ${itemSummary(item)}`} onPointerDown={e => drag.start(e)}>⠿</button><ItemIcon type={item.type} size={32} /><div><strong>{itemSummary(item)}</strong><small>{HAMPER_ITEM_REGISTRY[item.type].label}</small></div>
    <button type="button" aria-label={`Move ${itemSummary(item)} up`} disabled={index === 0} onClick={() => onMove(-1)}>↑</button><button type="button" aria-label={`Move ${itemSummary(item)} down`} disabled={index === count - 1} onClick={() => onMove(1)}>↓</button>
    <button type="button" onClick={onEdit}>Edit</button><button type="button" onClick={onRemove}>Remove</button>
  </Reorder.Item>;
}
