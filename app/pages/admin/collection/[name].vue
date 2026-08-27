<script setup lang="ts">
import { getAdminCollection } from '#shared/config/admin-collections'

// ─────────────────────────────────────────────────────────────
// صفحه‌ی عمومی کالکشن‌های ادمین — /admin/collection/[name]
// ─────────────────────────────────────────────────────────────
const route = useRoute()
const def = computed(() => getAdminCollection(String(route.params.name)))

if (!def.value) {
  throw createError({ statusCode: 404, message: 'این بخش مدیریت پیدا نشد' })
}

useHead(() => ({ title: `${def.value?.label ?? 'مدیریت'} — پنل مدیریت` }))
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})
</script>

<template>
  <div>
    <CollectionManager v-if="def" :key="def.id" :def="def" />
  </div>
</template>
