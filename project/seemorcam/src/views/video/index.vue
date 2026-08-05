<template>
  <div class="bg-background text-on-background min-h-screen font-body-md text-body-md overflow-x-hidden">
    <!-- Top App Bar -->
    <header class="flex justify-between items-center px-margin-page h-16 w-full bg-surface sticky top-0 z-40">
      <button @click="$router.back()" class="text-on-surface-variant hover:opacity-80 transition-opacity p-2 -ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <div class="flex items-center space-x-2">
        <img src="/logo.svg" alt="seemorcam logo" class="h-8 w-8 object-contain">
        <span class="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">seemorcam</span>
      </div>
      <button class="text-on-surface-variant hover:opacity-80 transition-opacity p-2 -mr-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
        <span class="material-symbols-outlined">more_vert</span>
      </button>
    </header>

    <main class="pb-24">
      <!-- Video Player Section -->
      <section class="w-full aspect-video bg-inverse-surface relative overflow-hidden shadow-md">
        <div class="absolute inset-0 w-full h-full bg-gradient-to-br from-[#2d5a3d] via-[#3d7a5d] to-[#1a3d2a] flex items-center justify-center">
          <span class="material-symbols-outlined text-6xl text-white/30">videocam</span>
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent pointer-events-none"></div>

        <!-- LIVE Badge -->
        <div class="absolute top-4 left-4 flex items-center space-x-2">
          <span class="flex h-3 w-3 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
          </span>
          <span class="text-on-error font-label-sm text-label-sm uppercase tracking-wider drop-shadow-md">Live</span>
        </div>

        <!-- Video Controls -->
        <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div class="flex space-x-4 text-on-error drop-shadow-md">
            <button class="p-2 bg-inverse-surface/40 backdrop-blur-md rounded-full hover:bg-inverse-surface/60 transition-colors">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">volume_up</span>
            </button>
            <button class="p-2 bg-inverse-surface/40 backdrop-blur-md rounded-full hover:bg-inverse-surface/60 transition-colors">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">mic</span>
            </button>
          </div>
          <div class="flex space-x-4 text-on-error drop-shadow-md">
            <button class="p-2 bg-inverse-surface/40 backdrop-blur-md rounded-full hover:bg-inverse-surface/60 transition-colors">
              <span class="material-symbols-outlined">photo_camera</span>
            </button>
            <button class="p-2 bg-inverse-surface/40 backdrop-blur-md rounded-full hover:bg-inverse-surface/60 transition-colors">
              <span class="material-symbols-outlined">videocam</span>
            </button>
            <button class="p-2 bg-inverse-surface/40 backdrop-blur-md rounded-full hover:bg-inverse-surface/60 transition-colors">
              <span class="material-symbols-outlined">fullscreen</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Events and Timeline -->
      <section class="px-margin-page py-stack-md mt-4">
        <div class="flex justify-between items-center mb-stack-sm">
          <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Recent Activity</h2>
          <button class="text-primary font-label-sm text-label-sm uppercase tracking-wider flex items-center">
            Filter <span class="material-symbols-outlined ml-1 text-[16px]">filter_list</span>
          </button>
        </div>

        <!-- Timeline -->
        <div class="bg-surface-container-low rounded-xl p-4 shadow-sm mb-stack-lg border border-outline-variant/30 relative">
          <div class="relative h-12 flex items-center">
            <div class="absolute left-0 right-0 h-1 bg-surface-variant rounded-full"></div>
            <div class="absolute left-[15%] h-3 w-3 bg-primary rounded-full transform -translate-y-1/2 top-1/2 shadow-sm cursor-pointer hover:scale-125 transition-transform" title="10:45 AM - Motion Detected"></div>
            <div class="absolute left-[45%] h-3 w-3 bg-secondary rounded-full transform -translate-y-1/2 top-1/2 shadow-sm cursor-pointer hover:scale-125 transition-transform" title="12:30 PM - Pet Detected"></div>
            <div class="absolute left-[70%] h-4 w-4 bg-primary border-2 border-surface-container-low rounded-full transform -translate-y-1/2 top-1/2 shadow-md z-10" title="Current Playhead"></div>
            <div class="absolute left-[85%] h-3 w-3 bg-primary rounded-full transform -translate-y-1/2 top-1/2 shadow-sm cursor-pointer hover:scale-125 transition-transform" title="02:15 PM - Motion Detected"></div>
            <span class="absolute left-0 bottom-[-20px] text-[10px] text-on-surface-variant">08:00</span>
            <span class="absolute left-1/2 transform -translate-x-1/2 bottom-[-20px] text-[10px] text-on-surface-variant">12:00</span>
            <span class="absolute right-0 bottom-[-20px] text-[10px] text-on-surface-variant">16:00</span>
          </div>
        </div>

        <!-- Event Cards -->
        <div class="space-y-stack-sm">
          <div class="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-primary flex space-x-4 items-center">
            <div class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden relative bg-surface-variant flex items-center justify-center">
              <span class="material-symbols-outlined text-outline text-2xl">directions_run</span>
              <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-xl" style="font-variation-settings: 'FILL' 1;">play_circle</span>
              </div>
            </div>
            <div class="flex-grow">
              <div class="flex justify-between items-start">
                <h3 class="font-label-sm text-label-sm text-on-surface">Motion Detected</h3>
                <span class="text-[10px] text-on-surface-variant">2 mins ago</span>
              </div>
              <p class="text-sm text-on-surface-variant mt-1 line-clamp-1">Activity in backyard zone.</p>
              <div class="mt-2 flex space-x-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-container text-on-primary-container">Human</span>
              </div>
            </div>
          </div>

          <div class="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 flex space-x-4 items-center opacity-80">
            <div class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-surface-variant flex items-center justify-center">
              <span class="material-symbols-outlined text-outline">pets</span>
            </div>
            <div class="flex-grow">
              <div class="flex justify-between items-start">
                <h3 class="font-label-sm text-label-sm text-on-surface">Pet Detected</h3>
                <span class="text-[10px] text-on-surface-variant">12:30 PM</span>
              </div>
              <p class="text-sm text-on-surface-variant mt-1 line-clamp-1">Dog spotted near fence.</p>
              <div class="mt-2 flex space-x-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary-container text-on-secondary-container">Animal</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
