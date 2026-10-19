<template>
  <div 
    ref="containerRef" 
    class="relative inline-block w-full text-left select-none transition-all min-w-0 max-w-full"
    :class="{ 'opacity-60 cursor-not-allowed': disabled, 'z-40': isOpen }"
  >
    <!-- Hidden native input to support forms if needed -->
    <input 
      v-if="name" 
      type="hidden" 
      :name="name" 
      :value="modelValue" 
    />

    <!-- Select Trigger Button -->
    <button
      ref="triggerRef"
      type="button"
      :disabled="disabled"
      @click="toggleDropdown"
      @keydown="handleKeyDown"
      class="w-full flex items-center justify-between gap-2 transition cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 active:scale-[0.99] select-none text-left min-w-0 max-w-full"
      :class="[buttonClasses, buttonClass]"
      :aria-expanded="isOpen"
      :aria-haspopup="'listbox'"
    >
      <div class="flex items-center gap-2 min-w-0 flex-1 truncate text-left">
        <component 
          v-if="selectedOption?.icon" 
          :is="selectedOption.icon" 
          class="w-3.5 h-3.5 shrink-0 opacity-70 text-blue-600 dark:text-blue-400" 
        />
        <span 
          class="truncate block min-w-0 flex-1"
          :class="{ 'text-slate-400 dark:text-slate-500 font-normal': !selectedOption }"
        >
          {{ selectedOption ? selectedOption.label : placeholder }}
        </span>
      </div>

      <div class="flex items-center gap-1.5 shrink-0 ml-1">
        <span 
          v-if="selectedOption?.badge" 
          class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
        >
          {{ selectedOption.badge }}
        </span>
        <ChevronDown 
          class="w-3.5 h-3.5 transition-transform duration-200 opacity-60 shrink-0 text-slate-500 dark:text-slate-400"
          :class="{ 'rotate-180': isOpen, 'text-blue-600 dark:text-blue-400 opacity-100': isOpen }"
        />
      </div>
    </button>

    <!-- Dropdown Menu Popover -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-1"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        ref="menuRef"
        class="absolute z-50 mt-1.5 max-h-64 sm:max-h-72 overflow-hidden flex flex-col shadow-2xl border rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/90 dark:border-slate-800/90 box-border text-slate-800 dark:text-slate-100"
        :class="[
          menuPlacementClasses,
          variant === 'dark' ? 'bg-slate-850/95 border-slate-700 text-slate-100 shadow-slate-950/60' : 'shadow-slate-900/15',
          menuClass
        ]"
        role="listbox"
      >
        <!-- Search Bar (if searchable or long list) -->
        <div 
          v-if="isSearchVisible" 
          class="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 shrink-0"
        >
          <div class="relative">
            <Search class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition shadow-2xs"
              @keydown.stop
            />
            <button
              v-if="searchQuery"
              type="button"
              @click="searchQuery = ''"
              class="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-0.5 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Options List -->
        <div class="overflow-y-auto overscroll-contain p-1.5 space-y-0.5 flex-1 min-w-0 max-w-full">
          <div
            v-if="filteredOptions.length === 0"
            class="py-4 px-3 text-center text-xs text-slate-400 dark:text-slate-500 italic"
          >
            Tidak ada opsi yang cocok
          </div>

          <button
            v-for="(option, index) in filteredOptions"
            :key="String(option.value)"
            type="button"
            :disabled="option.disabled"
            @click="selectOption(option)"
            @mouseenter="highlightedIndex = index"
            class="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left font-medium min-w-0 max-w-full group select-none active:scale-[0.99]"
            :class="[
              isSelected(option.value)
                ? (variant === 'dark' 
                    ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30' 
                    : 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/70 dark:border-blue-900/50 shadow-2xs')
                : highlightedIndex === index
                  ? (variant === 'dark' ? 'bg-slate-700/80 text-white' : 'bg-slate-100/90 dark:bg-slate-800 text-slate-900 dark:text-slate-100')
                  : (variant === 'dark' ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'),
              option.disabled ? 'opacity-40 cursor-not-allowed' : ''
            ]"
            role="option"
            :aria-selected="isSelected(option.value)"
          >
            <div class="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
              <component 
                v-if="option.icon" 
                :is="option.icon" 
                class="w-3.5 h-3.5 shrink-0 opacity-70" 
              />
              <div class="min-w-0 flex-1 overflow-hidden">
                <span class="truncate block text-xs font-semibold leading-tight">{{ option.label }}</span>
                <span 
                  v-if="option.sublabel" 
                  class="text-[10px] text-slate-400 dark:text-slate-500 block truncate font-normal mt-0.5 leading-tight"
                >
                  {{ option.sublabel }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1.5 shrink-0 pl-1">
              <span 
                v-if="option.badge" 
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="isSelected(option.value) ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60'"
              >
                {{ option.badge }}
              </span>
              <Check 
                v-if="isSelected(option.value)" 
                class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 stroke-[2.5]" 
              />
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, type Component } from 'vue';
import { ChevronDown, Check, Search } from 'lucide-vue-next';

export interface SelectOption {
  value: string | number | boolean;
  label: string;
  sublabel?: string;
  badge?: string;
  icon?: Component;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | boolean | null;
    options: (SelectOption | string | number)[];
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'pill' | 'dark' | 'compact';
    searchable?: boolean;
    searchPlaceholder?: string;
    disabled?: boolean;
    buttonClass?: string;
    menuClass?: string;
    name?: string;
    placement?: 'bottom' | 'top' | 'auto';
  }>(),
  {
    modelValue: '',
    placeholder: 'Pilih opsi...',
    size: 'md',
    variant: 'default',
    searchable: false,
    searchPlaceholder: 'Cari opsi...',
    disabled: false,
    buttonClass: '',
    menuClass: '',
    name: '',
    placement: 'auto'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean): void;
  (e: 'change', value: string | number | boolean): void;
}>();

const isOpen = ref(false);
const searchQuery = ref('');
const highlightedIndex = ref(-1);
const containerRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const dropdownPlacement = ref<'bottom' | 'top'>('bottom');
const horizontalAlignment = ref<'left' | 'right'>('left');

// Normalize options to SelectOption objects
const normalizedOptions = computed<SelectOption[]>(() => {
  return props.options.map(opt => {
    if (typeof opt === 'object' && opt !== null && 'value' in opt) {
      return {
        value: opt.value,
        label: opt.label !== undefined ? String(opt.label) : String(opt.value),
        sublabel: opt.sublabel,
        badge: opt.badge,
        icon: opt.icon,
        disabled: Boolean(opt.disabled)
      };
    }
    return {
      value: opt,
      label: String(opt),
      disabled: false
    };
  });
});

const isSearchVisible = computed(() => {
  return props.searchable || normalizedOptions.value.length >= 8;
});

const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) {
    return normalizedOptions.value;
  }
  const query = searchQuery.value.toLowerCase().trim();
  return normalizedOptions.value.filter(opt => {
    const matchLabel = opt.label.toLowerCase().includes(query);
    const matchSublabel = opt.sublabel?.toLowerCase().includes(query);
    const matchValue = String(opt.value).toLowerCase().includes(query);
    return matchLabel || matchSublabel || matchValue;
  });
});

const selectedOption = computed(() => {
  return normalizedOptions.value.find(opt => isSelected(opt.value));
});

function isSelected(val: string | number | boolean): boolean {
  if (props.modelValue === null || props.modelValue === undefined) return false;
  return String(props.modelValue) === String(val);
}

const buttonClasses = computed(() => {
  const classes: string[] = [];

  // Size
  if (props.size === 'sm') {
    classes.push('px-2.5 py-1.5 text-xs rounded-xl');
  } else if (props.size === 'lg') {
    classes.push('px-4 py-3 text-sm rounded-2xl');
  } else {
    // md
    classes.push('px-3.5 py-2 sm:py-2 text-xs rounded-2xl');
  }

  // Variant
  if (props.variant === 'pill') {
    classes.push(
      'rounded-2xl sm:rounded-full bg-slate-50/90 dark:bg-slate-800/90 hover:bg-slate-100/90 active:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 shadow-2xs font-semibold'
    );
  } else if (props.variant === 'dark') {
    classes.push(
      'rounded-xl bg-slate-800 hover:bg-slate-700/90 active:bg-slate-700 border border-slate-700 text-slate-200 shadow-2xs font-semibold'
    );
  } else if (props.variant === 'compact') {
    classes.push(
      'rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold shadow-2xs'
    );
  } else {
    // default
    classes.push(
      'rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 shadow-2xs font-medium'
    );
  }

  if (isOpen.value) {
    classes.push('border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/25 bg-white dark:bg-slate-800 shadow-sm');
  }

  return classes.join(' ');
});

const menuPlacementClasses = computed(() => {
  // Mobile (<640px): Full-width clamped precisely within container bounds (left-0 right-0 w-full max-w-full)
  // Tablet/Desktop (>=640px): Aligned left or right with sm:min-w-full and sm:max-w-md
  const isAlignRight = horizontalAlignment.value === 'right';
  const horizontal = isAlignRight
    ? 'left-0 right-0 w-full sm:w-auto sm:left-auto sm:right-0 sm:min-w-full max-w-full sm:max-w-md'
    : 'left-0 right-0 w-full sm:w-auto sm:left-0 sm:right-auto sm:min-w-full max-w-full sm:max-w-md';

  if (dropdownPlacement.value === 'top') {
    return `${horizontal} bottom-full mb-1.5`;
  }
  return `${horizontal} top-full mt-1.5`;
});

function toggleDropdown() {
  if (props.disabled) return;
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

function openDropdown() {
  isOpen.value = true;
  searchQuery.value = '';
  highlightedIndex.value = -1;

  calculatePlacement();

  nextTick(() => {
    // Hanya auto-focus pada perangkat desktop/PC dengan mouse & keyboard fisik.
    // Pada HP/tablet (layar sentuh / touch device), jangan langsung focus agar keyboard virtual tidak langsung muncul mengganggu user.
    const isMobileOrTouch = typeof window !== 'undefined' && (
      window.matchMedia('(pointer: coarse)').matches || 
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      window.innerWidth < 768
    );

    if (!isMobileOrTouch && isSearchVisible.value && searchInputRef.value) {
      searchInputRef.value.focus();
    }
  });
}

function closeDropdown() {
  isOpen.value = false;
  searchQuery.value = '';
  highlightedIndex.value = -1;
}

function selectOption(option: SelectOption) {
  if (option.disabled) return;
  emit('update:modelValue', option.value);
  emit('change', option.value);
  closeDropdown();
  triggerRef.value?.focus();
}

function calculatePlacement() {
  if (triggerRef.value && typeof window !== 'undefined') {
    const rect = triggerRef.value.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Check vertical space
    if (props.placement === 'top') {
      dropdownPlacement.value = 'top';
    } else if (props.placement === 'bottom') {
      dropdownPlacement.value = 'bottom';
    } else {
      const spaceBelow = windowHeight - rect.bottom;
      if (spaceBelow < 240 && rect.top > 240) {
        dropdownPlacement.value = 'top';
      } else {
        dropdownPlacement.value = 'bottom';
      }
    }

    // Check horizontal edge collision for desktop/tablet
    const spaceRight = windowWidth - rect.left;
    if (spaceRight < 240 && rect.right > 240) {
      horizontalAlignment.value = 'right';
    } else {
      horizontalAlignment.value = 'left';
    }
  } else {
    dropdownPlacement.value = props.placement === 'top' ? 'top' : 'bottom';
    horizontalAlignment.value = 'left';
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (props.disabled) return;

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (!isOpen.value) {
      openDropdown();
      return;
    }

    const total = filteredOptions.value.length;
    if (total === 0) return;

    if (e.key === 'ArrowDown') {
      highlightedIndex.value = (highlightedIndex.value + 1) % total;
    } else if (e.key === 'ArrowUp') {
      highlightedIndex.value = (highlightedIndex.value - 1 + total) % total;
    } else if (e.key === 'Enter') {
      if (highlightedIndex.value >= 0 && highlightedIndex.value < total) {
        selectOption(filteredOptions.value[highlightedIndex.value]);
      }
    }
  } else if (e.key === 'Escape') {
    closeDropdown();
  }
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    closeDropdown();
  }
}

watch(
  () => props.modelValue,
  () => {
    // sync state
  }
);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
