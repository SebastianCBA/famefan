<template>
    <StackLayout class="p-15 bg-primary">
        <Label class="h3" :text="titulo" />
    </StackLayout>
</template>

<script>
    export default {
        data() {
            return {
                titulo: null,
                postcontent: [],
                id: null
            };
        },
        mounted() {
            console.log('popup mounted');
        },
        methods: {
            setdata(id) {
                this.id = id;
                this.titulo = this.id;
            }
        }
    }
</script>

<style>
</style>