<script setup lang="ts">
import { useDatabase } from '@/database'
import { TenantAppData } from '@/schemas/tenantApp.schema'
import { store } from '@/store'
import { EntityForm } from '@/utils/dynamicFormIoUtils'
import { SyncLevel } from '@idpass/data-collect-core'
import { Formio } from '@formio/vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'

const route = useRoute()
const router = useRouter()
const database = useDatabase()

const props = defineProps<{
  id: string
  parentGuid: string
  entity: string
}>()

const tenantapp = ref<TenantAppData>()
const entityForm = ref<EntityForm>()
const loading = ref(false)
const saving = ref(false)
const formReady = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

onMounted(async () => {
  loading.value = true
  try {
    const foundDocuments = await database.tenantapps
      .find({
        selector: {
          id: route.params.id
        }
      })
      .exec()
    tenantapp.value = foundDocuments[0]

    entityForm.value = tenantapp.value.entityForms.find(
      (entity) => entity.name === route.params.entity
    )

    formReady.value = true
  } finally {
    loading.value = false
  }
})

const showSnackbar = (message: string, color: string = 'success') => {
  snackbarText.value = message
  snackbarColor.value = color
  snackbar.value = true
}

const handleFormSubmit = async (submission: any) => {
  saving.value = true
  try {
    const entityData = submission.data

    // Add parent GUID if available
    if (props.parentGuid) {
      entityData.parentGuid = props.parentGuid
    }

    // Add app version metadata
    if (tenantapp.value?.appVersion || tenantapp.value?.version) {
      entityData._appVersion = tenantapp.value.appVersion || tenantapp.value.version
    }

    const entityGuid = uuidv4()

    // Create the entity using submitForm
    await store.submitForm({
      guid: uuidv4(),
      entityGuid: entityGuid,
      type: 'create-group',
      data: entityData,
      timestamp: new Date().toISOString(),
      userId: 'local-user',
      syncLevel: SyncLevel.LOCAL
    })

    showSnackbar('Entity created successfully', 'success')

    // Navigate back to entity list
    setTimeout(() => {
      router.go(-1)
    }, 1000)
  } catch (error) {
    console.error('Error creating entity:', error)
    showSnackbar('Failed to create entity', 'error')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  router.go(-1)
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-btn icon @click="handleCancel">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-app-bar-title>Create New Entity</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

        <v-card v-if="tenantapp" class="mb-4" variant="tonal" color="primary">
          <v-card-text>
            <div class="text-h6">{{ entityForm?.title || entityForm?.name }}</div>
            <div class="text-caption">Fill in the form below to create a new entity</div>
          </v-card-text>
        </v-card>

        <v-card v-if="formReady">
          <v-card-text>
            <Formio v-if="entityForm" :form="entityForm.formio" @submit="handleFormSubmit" />
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="handleCancel" :disabled="saving">Cancel</v-btn>
            <v-btn
              color="primary"
              type="submit"
              form="formio"
              :loading="saving"
              :disabled="saving"
            >
              Create Entity
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>
