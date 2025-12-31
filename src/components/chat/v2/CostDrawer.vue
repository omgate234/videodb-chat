<template>
  <Teleport to="body">
    <NotificationCenter ref="notificationCenter" />

    <Transition name="drawer-backdrop">
      <div
        v-if="isOpen"
        class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-[100] vdb-c-bg-black/20"
        @click="handleBackdropClick"
      ></div>
    </Transition>

    <Transition name="drawer-slide">
      <div
        v-if="isOpen"
        class="vdb-c-fixed vdb-c-right-0 vdb-c-top-0 vdb-c-z-[101] vdb-c-flex vdb-c-h-full vdb-c-w-[620px] vdb-c-flex-col vdb-c-bg-white vdb-c-shadow-[-23px_0px_6px_0px_rgba(0,0,0,0),-15px_0px_6px_0px_rgba(0,0,0,0.01),-8px_0px_5px_0px_rgba(0,0,0,0.02),-4px_0px_4px_0px_rgba(0,0,0,0.03),-1px_0px_2px_0px_rgba(0,0,0,0.03)]"
      >
        <div class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col">
          <div
            class="vdb-c-flex vdb-c-shrink-0 vdb-c-flex-col vdb-c-items-start vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-[20px] vdb-c-py-[16px]"
          >
            <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px]">
              <div
                class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-justify-center vdb-c-text-[16px] vdb-c-font-semibold vdb-c-leading-[24px] vdb-c-text-[#1E1E1E]"
              >
                Cost Analytics
              </div>
              <button
                @click="refreshData"
                :disabled="isLoading"
                class="vdb-c-flex vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-[9px] vdb-c-py-[7px] vdb-c-transition-all hover:vdb-c-bg-[#F7F7F7] disabled:vdb-c-opacity-50"
              >
                <ResetIcon
                  :fill="'#1E1E1E'"
                  class="vdb-c-h-[16px] vdb-c-w-[16px] vdb-c-text-[#1E1E1E]"
                  :class="{ 'vdb-c-animate-spin': isLoading }"
                />
              </button>
              <button
                @click="$emit('close')"
                class="vdb-c-flex vdb-c-h-[18px] vdb-c-w-[18px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-transition-opacity hover:vdb-c-opacity-70"
              >
                <CrossIcon :fill="'#1E1E1E'" />
              </button>
            </div>
          </div>

          <div
            class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-items-start vdb-c-overflow-y-auto vdb-c-bg-white vdb-c-px-[20px] vdb-c-py-[30px]"
          >
            <div
              v-if="isLoading"
              class="vdb-c-flex vdb-c-w-full vdb-c-justify-center vdb-c-py-[40px]"
            >
              <div
                class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#969696]"
              >
                Loading cost data...
              </div>
            </div>

            <div v-else-if="error" class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[20px]">
              <div
                class="vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#E2462C] vdb-c-bg-[#FFF5F3] vdb-c-px-[16px] vdb-c-py-[12px] vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#E2462C]"
              >
                {{ error }}
              </div>
            </div>

            <div v-else class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[30px]">
              <!-- Cost by Provider -->
              <div class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[12px]">
                <div
                  class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-leading-[20px] vdb-c-text-[#1E1E1E]"
                >
                  Cost by Provider
                </div>
                <div
                  class="vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#EFEFEF]"
                >
                  <table class="vdb-c-w-full">
                    <thead class="vdb-c-bg-[#F7F7F7]">
                      <tr>
                        <th
                          class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-left vdb-c-text-[12px] vdb-c-font-semibold vdb-c-leading-[16px] vdb-c-text-[#464646]"
                        >
                          Provider
                        </th>
                        <th
                          class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-right vdb-c-text-[12px] vdb-c-font-semibold vdb-c-leading-[16px] vdb-c-text-[#464646]"
                        >
                          Requests
                        </th>
                        <th
                          class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-right vdb-c-text-[12px] vdb-c-font-semibold vdb-c-leading-[16px] vdb-c-text-[#464646]"
                        >
                          Tokens
                        </th>
                        <th
                          class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-right vdb-c-text-[12px] vdb-c-font-semibold vdb-c-leading-[16px] vdb-c-text-[#464646]"
                        >
                          Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(provider, index) in providerCosts"
                        :key="provider.name"
                        class="vdb-c-border-t vdb-c-border-[#EFEFEF]"
                      >
                        <td
                          class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[18px] vdb-c-text-[#1E1E1E]"
                        >
                          {{ provider.name }}
                        </td>
                        <td
                          class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-right vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[18px] vdb-c-text-[#464646]"
                        >
                          {{ formatNumber(provider.request_count) }}
                        </td>
                        <td
                          class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-right vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[18px] vdb-c-text-[#464646]"
                        >
                          {{ formatNumber(provider.total_tokens) }}
                        </td>
                        <td
                          class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-right vdb-c-text-[13px] vdb-c-font-semibold vdb-c-leading-[18px] vdb-c-text-[#1E1E1E]"
                        >
                          ${{ formatCost(provider.total_cost) }}
                        </td>
                      </tr>
                      <tr
                        v-if="providerCosts.length === 0"
                        class="vdb-c-border-t vdb-c-border-[#EFEFEF]"
                      >
                        <td
                          colspan="4"
                          class="vdb-c-px-[12px] vdb-c-py-[20px] vdb-c-text-center vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[18px] vdb-c-text-[#969696]"
                        >
                          No cost data available
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- All Costs -->
              <div class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[12px]">
                <div
                  class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-leading-[20px] vdb-c-text-[#1E1E1E]"
                >
                  Recent Costs
                </div>
                <div
                  class="vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#EFEFEF]"
                >
                  <div class="vdb-c-max-h-[400px] vdb-c-overflow-y-auto">
                    <table class="vdb-c-w-full">
                      <thead class="vdb-c-sticky vdb-c-top-0 vdb-c-bg-[#F7F7F7]">
                        <tr>
                          <th
                            class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-left vdb-c-text-[12px] vdb-c-font-semibold vdb-c-leading-[16px] vdb-c-text-[#464646]"
                          >
                            Model
                          </th>
                          <th
                            class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-right vdb-c-text-[12px] vdb-c-font-semibold vdb-c-leading-[16px] vdb-c-text-[#464646]"
                          >
                            Input
                          </th>
                          <th
                            class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-right vdb-c-text-[12px] vdb-c-font-semibold vdb-c-leading-[16px] vdb-c-text-[#464646]"
                          >
                            Output
                          </th>
                          <th
                            class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-right vdb-c-text-[12px] vdb-c-font-semibold vdb-c-leading-[16px] vdb-c-text-[#464646]"
                          >
                            Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(cost, index) in allCosts"
                          :key="cost.id || index"
                          class="vdb-c-border-t vdb-c-border-[#EFEFEF]"
                        >
                          <td
                            class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[18px] vdb-c-text-[#1E1E1E]"
                          >
                            <div
                              class="vdb-c-max-w-[200px] vdb-c-truncate"
                              :title="cost.model_name"
                            >
                              {{ cost.model_name }}
                            </div>
                          </td>
                          <td
                            class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-right vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[18px] vdb-c-text-[#464646]"
                          >
                            {{ formatNumber(cost.input_token) }}
                          </td>
                          <td
                            class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-right vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[18px] vdb-c-text-[#464646]"
                          >
                            {{ formatNumber(cost.output_token) }}
                          </td>
                          <td
                            class="vdb-c-px-[12px] vdb-c-py-[10px] vdb-c-text-right vdb-c-text-[13px] vdb-c-font-semibold vdb-c-leading-[18px] vdb-c-text-[#1E1E1E]"
                          >
                            ${{ formatCost(cost.final_cost) }}
                          </td>
                        </tr>
                        <tr
                          v-if="allCosts.length === 0"
                          class="vdb-c-border-t vdb-c-border-[#EFEFEF]"
                        >
                          <td
                            colspan="4"
                            class="vdb-c-px-[12px] vdb-c-py-[20px] vdb-c-text-center vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[18px] vdb-c-text-[#969696]"
                          >
                            No cost entries found
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { inject, onMounted, ref, watch } from 'vue';
import CrossIcon from './icons/CrossIcon.vue';
import ResetIcon from '../../icons/Reset.vue';
import NotificationCenter from '../elements/NotificationCenter.vue';
import RedExclamation from '../../icons/RedExclamation.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const chatContext = inject('videodb-chat-context', null);

const isLoading = ref(false);
const error = ref(null);
const allCosts = ref([]);
const providerCosts = ref([]);
const notificationCenter = ref(null);

const PROVIDERS = ['openai', 'anthropic', 'googleai'];

const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

const formatCost = (cost) => {
  if (!cost && cost !== 0) return '0.000000';
  return Number(cost).toFixed(6);
};

const fetchCostData = async () => {
  if (!chatContext?.fetchAllCostingsPerUser || !chatContext?.fetchTotalCostPerProvider) {
    error.value = 'Cost tracking is not available';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const [allCostsRes, ...providerResults] = await Promise.all([
      chatContext.fetchAllCostingsPerUser(),
      ...PROVIDERS.map((provider) => chatContext.fetchTotalCostPerProvider(provider)),
    ]);

    if (allCostsRes.status === 'success') {
      allCosts.value = Array.isArray(allCostsRes.data) ? allCostsRes.data : [];
    } else {
      throw new Error('Failed to fetch cost data');
    }

    providerCosts.value = providerResults
      .map((res, index) => {
        if (res.status === 'success' && res.data) {
          return {
            name: PROVIDERS[index],
            request_count: res.data.request_count || 0,
            total_tokens: (res.data.total_input_tokens || 0) + (res.data.total_output_tokens || 0),
            total_cost: res.data.total_cost || 0,
          };
        }
        return null;
      })
      .filter((item) => item !== null && item.request_count > 0);
  } catch (err) {
    console.error('Error fetching cost data:', err);
    error.value = 'Failed to load cost data. Please try again.';

    notificationCenter.value?.addNotification('Failed to load cost data', {
      type: 'error',
      icon: RedExclamation,
      duration: 5000,
    });
  } finally {
    isLoading.value = false;
  }
};

const refreshData = () => {
  fetchCostData();
};

const handleBackdropClick = () => {
  emit('close');
};

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      fetchCostData();
    } else {
      allCosts.value = [];
      providerCosts.value = [];
      error.value = null;
    }
  }
);

onMounted(() => {
  if (props.isOpen) {
    fetchCostData();
  }
});
</script>

<style scoped>
.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.vdb-c-animate-spin {
  animation: spin 1s linear infinite;
}
</style>
