<script setup lang="ts">
import { shallowRef, onMounted, onUnmounted, useTemplateRef, computed } from 'vue'
import PinkBubbles from './components/PinkBubbles.vue'
import EnvelopeHero from './components/EnvelopeHero.vue'
import MemorySection from './components/MemorySection.vue'
import PhotoGallery from './components/PhotoGallery.vue'
import SignatureBlock from './components/SignatureBlock.vue'
import MusicToggle from './components/MusicToggle.vue'
import PhotoLightbox from './components/PhotoLightbox.vue'
import { useAudioPlayer } from './composables/useAudioPlayer'
import { useLightbox, type LightboxPhoto } from './composables/useLightbox'
import { useReducedMotion } from './composables/useReducedMotion'

/* ─── State ─── */
const isOpened = shallowRef(false)
const showContent = shallowRef(false)

/* ─── Reduced Motion ─── */
const { isReduced } = useReducedMotion()

/* ─── Audio ─── */
const bgMusic = useAudioPlayer({
  src: '/audio/bg-romantic.mp3',
  loop: true,
  initialVolume: 0.35,
  fadeDuration: 1200,
})

/* ─── Lightbox ─── */
const lightbox = useLightbox()

/* All photos in the page (for lightbox navigation) */
const allPhotos: LightboxPhoto[] = [
  { src: '/photos/dragon-boat.jpg', alt: '鹿港龍舟夜晚合照', caption: '台中遠距離的半年' },
  { src: '/photos/japan-snow.jpg', alt: '日本雪景合照', caption: '日本看雪的約定' },
  { src: '/photos/wedding.jpg', alt: '婚禮合照', caption: '哥哥婚禮的驕傲時刻' },
  { src: '/photos/temple.jpg', alt: '寺廟合照', caption: '台中的美好時光' },
  { src: '/photos/japan-snow.jpg', alt: '日本雪景合照', caption: '初雪的浪漫' },
  { src: '/photos/wedding.jpg', alt: '婚禮合照', caption: '最帥的那一天' },
  { src: '/photos/temple.jpg', alt: '寺廟合照', caption: '台中的美好時光' },
  { src: '/photos/dragon-boat.jpg', alt: '龍舟合照', caption: '鹿港的夏夜' },
  { src: '/photos/adventure.jpg', alt: '戶外冒險合照', caption: '一起登頂的勇氣' },
]

/* Memory section images are indices 0–3, gallery images are 4–8 */
function openMemoryPhoto(memoryIndex: number) {
  lightbox.open(allPhotos, memoryIndex)
}

function openGalleryPhoto(galleryIndex: number) {
  lightbox.open(allPhotos, 4 + galleryIndex)
}

const lightboxTotal = computed(() => allPhotos.length)

/* ─── Envelope Open ─── */
function handleEnvelopeOpen() {
  isOpened.value = true
  setTimeout(() => {
    showContent.value = true
  }, 400)
  // Start music after user's first interaction (respects autoplay policy)
  if (!isReduced.value) {
    bgMusic.play()
  }
}

function handleEnvelopeSfx(type: string) {
  if (isReduced.value) return
  if (type === 'envelope-open') {
    bgMusic.playSfx('/audio/sfx-envelope.mp3', 0.25)
  }
}

/* ─── Click-anywhere hearts effect ─── */
interface ClickHeart {
  id: number
  x: number
  y: number
}

const clickHearts = shallowRef<ClickHeart[]>([])
let heartIdCounter = 0

function spawnClickHeart(e: MouseEvent) {
  if (!showContent.value || isReduced.value) return
  // Don't spawn on interactive elements
  const target = e.target as HTMLElement
  if (target.closest('button, a, [role="button"], input, .lightbox__backdrop')) return
  const id = ++heartIdCounter
  const heart: ClickHeart = { id, x: e.clientX, y: e.clientY }
  clickHearts.value = [...clickHearts.value, heart]
  setTimeout(() => {
    clickHearts.value = clickHearts.value.filter((h) => h.id !== id)
  }, 1200)
}

onMounted(() => {
  document.addEventListener('click', spawnClickHeart)
})

onUnmounted(() => {
  document.removeEventListener('click', spawnClickHeart)
})

/* ─── Parallax on Hero ─── */
const heroRef = useTemplateRef<HTMLElement>('hero')
const parallaxY = shallowRef(0)

function onScroll() {
  if (!heroRef.value || isReduced.value) return
  const rect = heroRef.value.getBoundingClientRect()
  if (rect.bottom > 0) {
    parallaxY.value = Math.round(-rect.top * 0.25)
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <PinkBubbles />

  <!-- Click hearts -->
  <Teleport to="body">
    <div
      v-for="h in clickHearts"
      :key="h.id"
      class="click-heart"
      :style="{ left: `${h.x}px`, top: `${h.y}px` }"
      aria-hidden="true"
    >
      💗
    </div>
  </Teleport>

  <!-- Envelope -->
  <Transition name="envelope-out">
    <EnvelopeHero
      v-if="!isOpened"
      @opened="handleEnvelopeOpen"
      @play-sfx="handleEnvelopeSfx"
    />
  </Transition>

  <!-- Music Toggle (visible after opening) -->
  <Transition name="music-fade">
    <MusicToggle
      v-if="showContent"
      :is-playing="bgMusic.isPlaying.value"
      :is-muted="bgMusic.isMuted.value"
      :volume="bgMusic.volume.value"
      @toggle="bgMusic.toggle()"
      @toggle-mute="bgMusic.toggleMute()"
      @update:volume="bgMusic.setVolume($event)"
    />
  </Transition>

  <!-- Lightbox -->
  <PhotoLightbox
    :is-open="lightbox.isOpen.value"
    :photo="lightbox.currentPhoto.value"
    :current-index="lightbox.currentIndex.value"
    :total="lightboxTotal"
    :has-next="lightbox.hasNext.value"
    :has-prev="lightbox.hasPrev.value"
    @close="lightbox.close()"
    @next="lightbox.next()"
    @prev="lightbox.prev()"
  />

  <!-- Letter content -->
  <Transition name="letter-in">
    <main v-if="showContent" class="letter">
      <!-- Birthday Hero -->
      <section ref="hero" class="hero">
        <div
          class="hero__bg"
          :style="{ transform: `translateY(${parallaxY}px)` }"
        >
          <img
            src="/photos/adventure.jpg"
            alt="戶外冒險合照"
            loading="eager"
            fetchpriority="high"
            width="1080"
            height="1440"
          />
        </div>
        <div class="hero__overlay" />
        <div class="hero__content">
          <span class="hero__age">29</span>
          <h1 class="hero__title">歲生日快樂！</h1>
          <p class="hero__subtitle">
            親愛的汶汶小公主（我最愛的大寶貝）
          </p>
          <div class="hero__scroll-hint">
            <span class="hero__arrow">↓</span>
          </div>
        </div>
      </section>

      <!-- Intro Paragraph -->
      <section class="prose-section">
        <div class="prose-section__inner">
          <p class="prose-section__text">
            不管是 27 歲還是 29 歲，在 32 歲的
            <strong>DK 桑</strong>
            眼裡，妳永遠都是那個需要被寵著的小朋友。未來的路，我會一直在前面幫妳探路、好好罩著妳！
          </p>
        </div>
      </section>

      <!-- Divider -->
      <div class="section-divider" aria-hidden="true">
        <span>✦</span>
      </div>

      <!-- Memory: 台中遠距離 -->
      <MemorySection
        title="台中遠距離的半年"
        image-src="/photos/dragon-boat.jpg"
        image-alt="鹿港龍舟夜晚合照"
        @image-click="openMemoryPhoto(0)"
      >
        <p>
          回想這一年多，心裡真的滿滿感動。謝謝妳在<strong>台中遠距離</strong>的那半年，每週五都不辭辛勞地下來陪我。那時我因為試用期考核壓力大、愛生氣，謝謝妳始終溫柔地陪我度過難關。不管是日月潭的散步還是鹿港的龍舟，只要有妳在，哪裡都好玩。
        </p>
      </MemorySection>

      <!-- Divider -->
      <div class="section-divider" aria-hidden="true">
        <span>✦</span>
      </div>

      <!-- Memory: 日本之旅 -->
      <MemorySection
        title="日本看雪的約定"
        image-src="/photos/japan-snow.jpg"
        image-alt="日本雪景合照"
        reverse
        @image-click="openMemoryPhoto(1)"
      >
        <p>
          今年 1 月的<strong>日本之旅</strong>，是我第一次挑戰自由行。謝謝妳給我滿滿安全感，陪我一起規畫、一起看雪。妳說過：「看雪景就是要跟喜歡的人一起看」，那個人絕對就是妳了。
        </p>
      </MemorySection>

      <!-- Divider -->
      <div class="section-divider" aria-hidden="true">
        <span>✦</span>
      </div>

      <!-- Memory: 婚禮 -->
      <MemorySection
        title="哥哥婚禮的驕傲時刻"
        image-src="/photos/wedding.jpg"
        image-alt="婚禮合照"
        @image-click="openMemoryPhoto(2)"
      >
        <p>
          還有哥哥婚禮那天，我把人生<strong>第一次穿西裝</strong>的帥氣樣子獻給了妳。看著妳體貼地幫忙、順利融入我的家人，爸媽跟親戚私底下都超級喜歡妳，我真的感到很驕傲。
        </p>
      </MemorySection>

      <!-- Divider -->
      <div class="section-divider" aria-hidden="true">
        <span>✦</span>
      </div>

      <!-- Memory: 台中時光 -->
      <MemorySection
        title="台中的美好時光"
        image-src="/photos/temple.jpg"
        image-alt="寺廟合照"
        reverse
        @image-click="openMemoryPhoto(3)"
      >
        <p>
          從阿里山升級的「貴賓室」驚喜，到今天的海港下午茶與手作蛋糕，我只想盡我所能把最好的都給妳。身為講求 CP 值的理科男，妳就是我人生中<strong>報酬率最高的決定</strong>！
        </p>
      </MemorySection>

      <!-- Photo Gallery -->
      <PhotoGallery @photo-click="openGalleryPhoto" />

      <!-- Promise Section -->
      <section class="promise">
        <div class="promise__inner">
          <p class="promise__text">
            未來我會繼續當那個幫妳盛滿盤子、隨時準備開瓶蓋，還要帶著小寶貝一起運動的大寶貝！
          </p>
          <p class="promise__highlight">
            如果要給這份愛加上期限，<br />
            我依然希望是<span class="promise__accent">一萬年</span>！
          </p>
        </div>
      </section>

      <!-- Signature -->
      <SignatureBlock />
    </main>
  </Transition>
</template>

<style scoped>
/* ─── Transitions ─── */
.envelope-out-leave-active {
  transition:
    opacity 0.6s ease-in,
    transform 0.6s ease-in;
}

.envelope-out-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-60px);
}

.letter-in-enter-active {
  transition:
    opacity 1s var(--ease-out-expo),
    transform 1s var(--ease-out-expo);
}

.letter-in-enter-from {
  opacity: 0;
  transform: translateY(80px);
}

.music-fade-enter-active {
  transition:
    opacity 0.8s 0.6s var(--ease-out-expo),
    transform 0.8s 0.6s var(--ease-out-expo);
}

.music-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.music-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.music-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* ─── Click Heart ─── */
.click-heart {
  position: fixed;
  pointer-events: none;
  font-size: 1.6rem;
  z-index: 9999;
  animation: click-heart-rise 1.2s var(--ease-out-expo) forwards;
  transform: translate(-50%, -50%);
}

@keyframes click-heart-rise {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0);
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, calc(-50% - 120px)) scale(0.6);
  }
}

/* ─── Letter Main ─── */
.letter {
  position: relative;
  z-index: 10;
}

/* ─── Birthday Hero ─── */
.hero {
  position: relative;
  height: 100vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: -25% 0 0 0;
  will-change: transform;
}

.hero__bg img {
  width: 100%;
  height: 125%;
  object-fit: cover;
  object-position: center 30%;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(253, 242, 245, 0.3) 0%,
    rgba(253, 232, 238, 0.6) 40%,
    rgba(251, 207, 218, 0.85) 70%,
    var(--cream) 100%
  );
}

.hero__content {
  position: relative;
  text-align: center;
  z-index: 2;
  animation: hero-fade-in 1.2s 0.3s var(--ease-out-expo) both;
}

@keyframes hero-fade-in {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero__age {
  font-family: var(--font-accent);
  font-size: clamp(6rem, 15vw, 12rem);
  font-weight: 300;
  line-height: 1;
  background: linear-gradient(
    135deg,
    var(--rose-400),
    var(--champagne) 50%,
    var(--rose-500)
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
  display: block;
  margin-bottom: -10px;
}

.hero__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: var(--text-dark);
  margin-bottom: 16px;
  font-weight: 400;
}

.hero__subtitle {
  font-size: 1.15rem;
  color: var(--text-body);
  letter-spacing: 2px;
}

.hero__scroll-hint {
  margin-top: 50px;
}

.hero__arrow {
  display: inline-block;
  font-size: 1.4rem;
  color: var(--rose-400);
  animation: bounce-down 2s ease-in-out infinite;
}

@keyframes bounce-down {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(12px); opacity: 1; }
}

/* ─── Prose Section ─── */
.prose-section {
  padding: 80px 40px;
  background: var(--cream);
}

.prose-section__inner {
  max-width: 680px;
  margin: 0 auto;
}

.prose-section__text {
  font-size: 1.15rem;
  line-height: 2.2;
  text-align: center;
  color: var(--text-body);
}

/* ─── Section Divider ─── */
.section-divider {
  text-align: center;
  padding: 10px 0;
  color: var(--rose-300);
  font-size: 0.75rem;
  letter-spacing: 8px;
}

/* ─── Promise Section ─── */
.promise {
  padding: 80px 40px;
  background: linear-gradient(
    to bottom,
    var(--cream),
    var(--blush)
  );
}

.promise__inner {
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
}

.promise__text {
  font-size: 1.1rem;
  line-height: 2.2;
  color: var(--text-body);
  margin-bottom: 30px;
}

.promise__highlight {
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--text-dark);
  line-height: 1.8;
}

.promise__accent {
  font-size: 2.2rem;
  background: linear-gradient(135deg, var(--rose-500), var(--champagne));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .hero {
    min-height: 500px;
  }

  .prose-section {
    padding: 50px 24px;
  }

  .promise {
    padding: 50px 24px;
  }

  .promise__highlight {
    font-size: 1.4rem;
  }

  .promise__accent {
    font-size: 1.8rem;
  }
}
</style>
