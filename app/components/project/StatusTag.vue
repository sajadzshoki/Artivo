<script setup lang="ts">
import type { ProjectStatus } from '#shared/config/project-status'
import { projectStatusLabels, projectStatusTones } from '#shared/config/project-status'

// برچسب وضعیت پروژه — یک نقطه‌ی نمایش برای همه‌ی صفحات
const props = withDefaults(defineProps<{
  status: ProjectStatus
  dot?: boolean
}>(), { dot: true })
</script>

<template>
  <ATag :label="projectStatusLabels[props.status]" :tone="projectStatusTones[props.status]" :dot="dot" />
</template>
