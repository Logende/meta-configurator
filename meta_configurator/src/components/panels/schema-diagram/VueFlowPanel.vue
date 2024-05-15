<script setup lang="ts">
import {computed, nextTick, onMounted, ref, watch} from 'vue';
import type {Ref} from 'vue';

import {useVueFlow, VueFlow} from '@vue-flow/core';
import SchemaObjectNode from '@/components/panels/schema-diagram/SchemaObjectNode.vue';
import {getDataForMode, getSchemaForMode, getSessionForMode} from '@/data/useDataLink';
import {constructSchemaGraph} from '@/components/panels/schema-diagram/schemaGraphConstructor';
import {SessionMode} from '@/store/sessionMode';
import type {Path} from '@/utility/path';
import {useLayout} from './useLayout';
import type {Edge, Node} from '@/components/panels/schema-diagram/schemaDiagramTypes';
import SchemaEnumNode from '@/components/panels/schema-diagram/SchemaEnumNode.vue';
import {useSettings} from '@/settings/useSettings';
import {
  findBestMatchingData,
  findBestMatchingNode,
} from '@/components/panels/schema-diagram/schemaDiagramHelper';
import {SchemaElementData} from '@/components/panels/schema-diagram/schemaDiagramTypes';
import {findForwardConnectedNodesAndEdges} from "@/components/panels/schema-diagram/findConnectedNodes";


const emit = defineEmits<{
  (e: 'zoom_into_path_absolute', path_to_add: Path): void;
  (e: 'select_path_absolute', path: Path): void;
}>();

const schemaData = getDataForMode(SessionMode.SchemaEditor);
const schemaSession = getSessionForMode(SessionMode.SchemaEditor);
const dataSchema = getSchemaForMode(SessionMode.DataEditor);

const activeNodes: Ref<Node[]> = ref<Node[]>([]);
const activeEdges: Ref<Edge[]> = ref<Edge[]>([]);

const graphDirection = computed(() => {
  // note that having edges from left ro right will usually lead to a more vertical graph, because usually it is
  // not very deeply nested, but there exist many nodes on the same levels
  return useSettings().schemaDiagram.vertical ? 'LR' : 'TB';
});

const selectedNode: Ref<Node | undefined> = ref(undefined);
const selectedData: Ref<SchemaElementData | undefined> = ref(undefined);

const currentRootNodePath: Ref<Path> = ref([]);

watch(getSchemaForMode(SessionMode.DataEditor).schemaPreprocessed, () => {
  updateGraph();

  nextTick(() => {
    layoutGraph(graphDirection.value);
  });
});


watch(schemaSession.currentPath, () => {
  updateGraph();

  nextTick(() => {
    layoutGraph(graphDirection.value);
  });
});

onMounted(() => {
  updateGraph();
});

// scroll to the current selected element when it changes
watch(
  schemaSession.currentSelectedElement,
  () => {
    const absolutePath = schemaSession.currentSelectedElement.value;
    const bestMatchingNode = findBestMatchingNode(activeNodes.value, absolutePath);
    selectedNode.value = bestMatchingNode;
    selectedData.value = findBestMatchingData(bestMatchingNode, absolutePath);
    if (bestMatchingNode && useSettings().schemaDiagram.moveViewToSelectedElement) {
      nextTick(() => {
        fitView({
          nodes: [bestMatchingNode.id],
          duration: 1000,
          padding: 1,
          maxZoom: useSettings().schemaDiagram.automaticZoomMaxValue,
          minZoom: useSettings().schemaDiagram.automaticZoomMinValue,
        });
      });
    }
  },
  {deep: true}
);

function updateGraph() {
  // TODO: compare new and old nodes and then if no nodes are added, only update the data and if needed remove some node
    const schema = dataSchema.schemaPreprocessed.value;
  const graph = constructSchemaGraph(schema);

  const vueFlowGraph = graph.toVueFlowGraph();
  activeNodes.value = vueFlowGraph.nodes;
  activeEdges.value = vueFlowGraph.edges;
  currentRootNodePath.value = [];

  // if not on root level but current path is set: show only subgraph
  const currentPath: Path = schemaSession.currentPath.value;
  if (currentPath.length > 0) {
    updateToSubgraph(currentPath);
  }
}

function updateToSubgraph(path: Path) {
  const bestMatchingNode = findBestMatchingNode(activeNodes.value, path);
  if (bestMatchingNode) {
    const [currentNodes, currentEdges] = findForwardConnectedNodesAndEdges(activeNodes.value, activeEdges.value, bestMatchingNode);
    activeNodes.value = currentNodes;
    activeEdges.value = currentEdges;
    currentRootNodePath.value = bestMatchingNode.data.absolutePath;
  }
}

const {layout} = useLayout();
const {fitView} = useVueFlow();

async function layoutGraph(direction: string) {
  activeNodes.value = layout(activeNodes.value, activeEdges.value, direction);
  nextTick(() => {
    fitView();
  });
}

function selectElement(path: Path) {
  if (schemaData.dataAt(path) != undefined) {
    emit('select_path_absolute', path);
  }
}

function zoomIntoElement(path: Path) {
  emit('zoom_into_path_absolute', path);
}
</script>

<template>
  <div class="layout-flow">
    <VueFlow
      :nodes="activeNodes"
      :edges="activeEdges"
      @nodes-initialized="layoutGraph(graphDirection)"
      :max-zoom="4"
      :min-zoom="0.1">
      <template #node-schemaobject="props">
        <SchemaObjectNode
          :data="props.data"
          @select_element="selectElement"
          @zoom_into_element="zoomIntoElement"
          :source-position="props.sourcePosition"
          :target-position="props.targetPosition"
          :selected-data="selectedData" />
      </template>
      <template #node-schemaenum="props">
        <SchemaEnumNode
          :data="props.data"
          @select_element="selectElement"
          :source-position="props.sourcePosition"
          :target-position="props.targetPosition"
          :selected-data="selectedData" />
      </template>
    </VueFlow>
  </div>
</template>

<style>
.layout-flow {
  background-color: white;
  height: 100%;
  width: 100%;
}
</style>