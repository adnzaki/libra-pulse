<template>
  <div 
    v-if="totalItems > 0"
    class="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none transition-all"
  >
    <!-- Left: Data range and Page size selector -->
    <div class="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">
      <span>
        Menampilkan <strong class="text-slate-800 dark:text-slate-200">{{ startItem }}</strong> - 
        <strong class="text-slate-800 dark:text-slate-200">{{ endItem }}</strong> 
        dari <strong class="text-slate-800 dark:text-slate-200">{{ totalItems }}</strong> {{ itemName }}
      </span>

      <!-- Baris selector identical to Master Data Buku -->
      <div v-if="showItemsPerPage" class="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
        <span class="text-slate-400">Baris:</span>
        <div class="w-24">
          <CustomSelect 
            :model-value="itemsPerPage"
            @update:model-value="onItemsPerPageChange"
            :options="paginationOptions"
            variant="compact"
            size="sm"
            placement="top"
          />
        </div>
      </div>
    </div>

    <!-- Right: Page Navigation Buttons (Exact Master Data Buku style: ChevronsLeft, ChevronLeft, Hal X / Y, ChevronRight, ChevronsRight) -->
    <div class="flex items-center gap-1 shrink-0">
      <button 
        type="button"
        @click="goToPage(1)"
        :disabled="currentPage === 1"
        class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer active:scale-95 shadow-2xs"
        title="Halaman Pertama"
      >
        <ChevronsLeft class="w-4 h-4" />
      </button>

      <button 
        type="button"
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer active:scale-95 shadow-2xs"
        title="Halaman Sebelumnya"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <div class="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap px-1">
        <span>Hal</span>
        <input 
          type="number"
          :min="1"
          :max="totalPages"
          :value="currentPage"
          @change="onPageInputChange"
          @keydown.enter="onPageInputChange"
          class="w-12 px-1.5 py-0.5 text-center font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono shadow-2xs"
          title="Ketik nomor halaman lalu tekan Enter"
        />
        <span class="text-slate-500 dark:text-slate-400">/ {{ totalPages }}</span>
      </div>

      <button 
        type="button"
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer active:scale-95 shadow-2xs"
        title="Halaman Selanjutnya"
      >
        <ChevronRight class="w-4 h-4" />
      </button>

      <button 
        type="button"
        @click="goToPage(totalPages)"
        :disabled="currentPage >= totalPages"
        class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer active:scale-95 shadow-2xs"
        title="Halaman Terakhir"
      >
        <ChevronsRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-vue-next';
import CustomSelect from './CustomSelect.vue';

interface Option {
  value: number;
  label: string;
}

const props = withDefaults(defineProps<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  itemName?: string;
  showItemsPerPage?: boolean;
  paginationOptions?: Option[];
}>(), {
  itemsPerPage: 25,
  itemName: 'data',
  showItemsPerPage: true,
  paginationOptions: () => [
    { value: 10, label: '10 / baris' },
    { value: 25, label: '25 / baris' },
    { value: 50, label: '50 / baris' }
  ]
});

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
  (e: 'update:itemsPerPage', items: number): void;
}>();

const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return ((props.currentPage - 1) * props.itemsPerPage) + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems);
});

const goToPage = (page: number) => {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return;
  emit('update:currentPage', page);
};

const onPageInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  let val = parseInt(target.value, 10);
  if (isNaN(val) || val < 1) val = 1;
  if (val > props.totalPages) val = props.totalPages;
  target.value = String(val);
  goToPage(val);
};

const onItemsPerPageChange = (val: any) => {
  const num = Number(val);
  if (!isNaN(num) && num > 0) {
    emit('update:itemsPerPage', num);
    emit('update:currentPage', 1);
  }
};
</script>
