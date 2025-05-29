<script setup lang="ts">
import { http } from '@/services/http'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LoadingBrand from '@/components/LoadingBrand.vue'
import notFoundIcon from '@/assets/undraw_back-home_3dun.svg'
import type { components } from '@/types/api'

type SearchResultDto = components['schemas']['SearchResultDto']
</script>