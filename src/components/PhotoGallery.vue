<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'

export interface GalleryPhoto {
  src: string
  alt: string
  caption: string
  span?: 'wide' | 'tall'
}

const emit = defineEmits<{
  'photo-click': [index: number]
}>()

const base = import.meta.env.BASE_URL

const photos: GalleryPhoto[] = [
  { src: `${base}photos/japan-snow.jpg`, alt: '日本雪景合照', caption: '初雪的浪漫', span: 'wide' },
  { src: `${base}photos/wedding.jpg`, alt: '婚禮合照', caption: '最帥的那一天', span: 'tall' },
  { src: `${base}photos/dragon-boat.jpg`, alt: '龍舟合照', caption: '鹿港的夏夜' },
  { src: `${base}photos/houfeng_bikeway.jpg`, alt: '龍舟合照', caption: '鹿港的夏夜' },
  { src: `${base}photos/houfeng_bikeway.jpg`, alt: '后里鐵馬道', caption: '后里馬場雙人協力車' },
  { src: `${base}photos/temple.jpg`, alt: '寺廟合照', caption: '台南的美好時光' },
  { src: `${base}photos/eyes_on_you.jpg`, alt: '眼中只有你', caption: '阿里山夕陽/日出下的浪漫', span: 'wide' },
  { src: `${base}photos/adventure.jpg`, alt: '台南鹽山合照', caption: '台南鹽山 — 一起登頂的勇氣', span: 'tall' },
  { src: `${base}photos/sweet_birthday_moments.jpg`, alt: '生日當天', caption: '美好時光', span: 'wide'  },
]

defineExpose({ photos })

const galleryRef = useTemplateRef<HTMLElement>('gallery')
const { isRevealed } = useScrollReveal(galleryRef, { threshold: 0.08 })
</script>

<template>
  <section
    ref="gallery"
    class="gallery"
    :class="{ 'gallery--revealed': isRevealed }"
  >
    <h2 class="gallery__heading">我們的回憶</h2>
    <p class="gallery__sub">每一張照片，都是一個心動的瞬間</p>

    <div class="gallery__grid">
      <figure
        v-for="(photo, idx) in photos"
        :key="photo.src"
        class="gallery__item"
        :class="{
          'gallery__item--wide': photo.span === 'wide',
          'gallery__item--tall': photo.span === 'tall',
        }"
        :style="{ '--i': idx }"
        role="button"
        tabindex="0"
        :aria-label="`查看照片：${photo.caption}`"
        @click="emit('photo-click', idx)"
        @keydown.enter="emit('photo-click', idx)"
        @keydown.space.prevent="emit('photo-click', idx)"
      >
        <img :src="photo.src" :alt="photo.alt" loading="lazy" />
        <figcaption class="gallery__caption">{{ photo.caption }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.gallery {
  max-width: 1100px;
  margin: 0 auto;
  padding: 100px 40px;
  text-align: center;
  opacity: 0;
  transform: translateY(40px);
  transition:
    opacity 0.8s var(--ease-out-expo),
    transform 0.8s var(--ease-out-expo);
}

.gallery--revealed {
  opacity: 1;
  transform: translateY(0);
}

.gallery__heading {
  font-family: var(--font-display);
  font-size: 2.4rem;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.gallery__sub {
  font-family: var(--font-accent);
  font-size: 1.15rem;
  color: var(--text-soft);
  font-style: italic;
  margin-bottom: 50px;
  letter-spacing: 1px;
}

/* Masonry-like grid */
.gallery__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 220px;
  gap: 16px;
}

.gallery__item {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0;
  transform: translateY(30px) scale(0.96);
  transition:
    opacity 0.7s calc(var(--i) * 0.12s) var(--ease-out-expo),
    transform 0.7s calc(var(--i) * 0.12s) var(--ease-out-expo);
}

.gallery--revealed .gallery__item {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.gallery__item--wide {
  grid-column: span 2;
}

.gallery__item--tall {
  grid-row: span 2;
}

.gallery__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease-out-expo);
}

.gallery__item:hover img {
  transform: scale(1.08);
}

.gallery__item:focus-visible {
  outline: 3px solid var(--rose-300);
  outline-offset: 3px;
}

.gallery__caption {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(
    to top,
    rgba(61, 32, 39, 0.65) 0%,
    rgba(61, 32, 39, 0) 60%
  );
  color: white;
  font-family: var(--font-display);
  font-size: 1.2rem;
  letter-spacing: 2px;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.4s ease,
    transform 0.4s var(--ease-out-expo);
}

.gallery__item:hover .gallery__caption {
  opacity: 1;
  transform: translateY(0);
}

/* Touch devices: always show captions */
@media (hover: none) {
  .gallery__caption {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .gallery {
    padding: 60px 16px;
  }

  .gallery__grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 180px;
    gap: 10px;
  }

  .gallery__item--wide {
    grid-column: span 2;
  }

  .gallery__heading {
    font-size: 1.8rem;
  }

  .gallery__sub {
    font-size: 1rem;
    margin-bottom: 30px;
  }

  .gallery__caption {
    font-size: 1rem;
    padding: 14px;
  }
}

@media (max-width: 480px) {
  .gallery__grid {
    grid-auto-rows: 140px;
    gap: 8px;
  }

  .gallery__item {
    border-radius: 10px;
  }
}
</style>
