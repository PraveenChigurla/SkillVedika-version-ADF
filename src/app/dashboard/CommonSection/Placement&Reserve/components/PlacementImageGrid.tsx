"use client";

import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiUploadCloud, FiTrash2, FiMove } from "react-icons/fi";

interface SortableItemProps {
  id: string;
  image: string;
  index: number;
  onUpload: (file: File, index: number) => void;
  onRemove: (index: number) => void;
}

function SortableItem({
  id,
  image,
  index,
  onUpload,
  onRemove,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group border rounded-xl bg-white shadow-sm overflow-hidden"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 bg-white/90 p-1 rounded cursor-grab"
      >
        <FiMove size={16} />
      </div>

      {/* Image */}
      <div className="aspect-[3/2] relative">
        <Image
          src={image}
          alt={`placement-${index}`}
          fill
          className="object-contain p-3"
        />
      </div>

      {/* Hover Actions */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
        <label className="cursor-pointer bg-white text-sm px-3 py-2 rounded flex items-center gap-1">
          <FiUploadCloud />
          Replace
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              e.target.files && onUpload(e.target.files[0], index)
            }
          />
        </label>

        <button
          onClick={() => onRemove(index)}
          className="bg-red-600 text-white px-3 py-2 rounded flex items-center gap-1"
        >
          <FiTrash2 />
          Remove
        </button>
      </div>
    </div>
  );
}

interface Props {
  images: string[];
  setImages: (imgs: string[]) => void;
  onUpload: (file: File, index?: number) => void;
  onRemove: (index: number) => void;
}

export default function PlacementImageGrid({
  images,
  setImages,
  onUpload,
  onRemove,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img === active.id);
    const newIndex = images.findIndex((img) => img === over.id);

    setImages(arrayMove(images, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={images} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <SortableItem
              key={img}
              id={img}
              image={img}
              index={idx}
              onUpload={(file) => onUpload(file, idx)}
              onRemove={onRemove}
            />
          ))}

          {/* ADD NEW IMAGE */}
          <label className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-600 hover:text-blue-600 transition min-h-[140px]">
            <FiUploadCloud size={28} />
            <span className="text-sm mt-2">Upload Image</span>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                e.target.files && onUpload(e.target.files[0])
              }
            />
          </label>
        </div>
      </SortableContext>
    </DndContext>
  );
}
