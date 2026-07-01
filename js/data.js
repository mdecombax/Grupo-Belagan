/* =========================================================
   GRUPO BELEGAN — Datos de propiedades (fuente única)
   ---------------------------------------------------------
   Para IMPORTAR datos reales: reemplaza el contenido de
   BELEGAN_PROPERTIES respetando este esquema. Todo el sitio
   (catálogo, ficha de detalle, similares) se actualiza solo.

   Esquema de cada propiedad:
     id          {string}  Identificador único y estable (slug). Va en la URL: propiedad.html?id=<id>
     name        {string}  Nombre comercial de la propiedad
     op          {string}  "venta" | "renta"
     tipo        {string}  "Casa" | "Departamento" | "Oficina" | "Local" | "Terreno"
     zona        {string}  Colonia / zona
     ciudad      {string}  Ciudad (por defecto Querétaro)
     price       {number}  Precio en MXN (mensual si op = "renta")
     beds        {number}  Recámaras (0 si no aplica)
     baths       {number}  Baños (acepta decimales, ej. 3.5)
     parking     {number}  Cajones de estacionamiento (0 si no aplica)
     m2          {number}  Superficie en m²
     description {string}  Descripción larga
     features    {string[]} Lista de características / amenidades
     photos      {string[]} Fotos. Acepta URL completa (https://...) o ID de Unsplash.
                            La primera es la portada.
   ========================================================= */
(function () {
  "use strict";

  window.BELEGAN_PROPERTIES = [
    {
      id: "casa-aurea", name: "Casa Aurea", op: "venta", tipo: "Casa",
      zona: "Zibatá", ciudad: "Querétaro", price: 8750000,
      beds: 4, baths: 4.5, parking: 2, m2: 280,
      description: "Residencia contemporánea en el corazón de Zibatá, con dobles alturas, acabados de lujo y una integración fluida entre interior y jardín. Ideal para familias que buscan privacidad, luz natural y una ubicación con plusvalía sostenida.",
      features: ["Alberca privada", "Jardín paisajista", "Cocina integral equipada", "Domótica", "Caseta de vigilancia 24/7"],
      photos: ["1512917774080-9991f1c4c750", "1600607687939-ce8a6c25118c", "1600566753086-00f18fb6b3ea"],
    },
    {
      id: "departamento-vertice", name: "Departamento Vértice", op: "renta", tipo: "Departamento",
      zona: "Juriquilla", ciudad: "Querétaro", price: 24500,
      beds: 2, baths: 2, parking: 1, m2: 120,
      description: "Departamento luminoso en torre con amenidades, a pasos de las mejores plazas de Juriquilla. Espacios abiertos, terraza con vista y acabados modernos listos para habitar.",
      features: ["Amueblado", "Gimnasio", "Roof garden", "Seguridad controlada", "Pet friendly"],
      photos: ["1502672260266-1c1ef2d93688", "1505691938895-1758d7feb511", "1522708323590-d24dbb6b0267"],
    },
    {
      id: "casa-niebla", name: "Casa Niebla", op: "venta", tipo: "Casa",
      zona: "El Marqués", ciudad: "Querétaro", price: 6450000,
      beds: 3, baths: 3.5, parking: 2, m2: 250,
      description: "Casa de líneas limpias en fraccionamiento consolidado de El Marqués. Distribución inteligente en dos niveles, amplio family room y patio de servicio, perfecta para primera vivienda familiar.",
      features: ["Cuarto de TV", "Jardín trasero", "Clósets de madera", "Cisterna", "Cerca de vías principales"],
      photos: ["1600585154340-be6161a56a0c", "1600210492486-724fe5c67fb0", "1600607687939-ce8a6c25118c"],
    },
    {
      id: "oficina-corporativa", name: "Oficina Corporativa", op: "renta", tipo: "Oficina",
      zona: "Centro Sur", ciudad: "Querétaro", price: 18000,
      beds: 0, baths: 2, parking: 3, m2: 85,
      description: "Oficina en edificio corporativo de Centro Sur, la zona de negocios de mayor crecimiento. Espacio diáfano acondicionado, ideal para despachos, agencias o consultorías.",
      features: ["Recepción compartida", "Aire acondicionado", "Fibra óptica", "Sala de juntas", "Estacionamiento para visitas"],
      photos: ["1497366754035-f200968a6e72", "1497366216548-37526070297c", "1524758631624-e2822e304c36"],
    },
    {
      id: "residencia-robles", name: "Residencia Robles", op: "venta", tipo: "Casa",
      zona: "Jurica", ciudad: "Querétaro", price: 12900000,
      beds: 4, baths: 5, parking: 3, m2: 420,
      description: "Residencia de gran formato en Jurica, sobre terreno arbolado y con acabados premium. Estancias generosas, estudio, cuarto de servicio y una terraza pensada para recibir.",
      features: ["Terreno arbolado", "Estudio / biblioteca", "Cuarto de servicio", "Bodega", "Doble sala"],
      photos: ["1564013799919-ab600027ffc6", "1600566753086-00f18fb6b3ea", "1600585154340-be6161a56a0c"],
    },
    {
      id: "loft-central", name: "Loft Central", op: "renta", tipo: "Departamento",
      zona: "Centro Histórico", ciudad: "Querétaro", price: 16800,
      beds: 1, baths: 1, parking: 1, m2: 68,
      description: "Loft con carácter en pleno Centro Histórico, combinando muros de cantera originales con un interior de diseño. A unos pasos de andadores, cafés y galerías.",
      features: ["Amueblado", "Muros de cantera", "Cocina abierta", "Estacionamiento asignado", "Ubicación caminable"],
      photos: ["1560448204-e02f11c3d0e2", "1505691938895-1758d7feb511", "1502672260266-1c1ef2d93688"],
    },
    {
      id: "casa-alba", name: "Casa Alba", op: "venta", tipo: "Casa",
      zona: "El Refugio", ciudad: "Querétaro", price: 4980000,
      beds: 3, baths: 2.5, parking: 2, m2: 210,
      description: "Casa lista para estrenar en El Refugio, con excelente iluminación y una distribución práctica. Gran opción de inversión o primera vivienda en una de las zonas de mayor demanda.",
      features: ["Lista para estrenar", "Jardín", "Cocina equipada", "Zona de lavado", "Fraccionamiento con amenidades"],
      photos: ["1600596542815-ffad4c1539a9", "1600210492486-724fe5c67fb0", "1600607687939-ce8a6c25118c"],
    },
    {
      id: "terreno-cimatario", name: "Terreno Cimatario", op: "venta", tipo: "Terreno",
      zona: "Cimatario", ciudad: "Querétaro", price: 3200000,
      beds: 0, baths: 0, parking: 0, m2: 500,
      description: "Terreno plano y regular en zona residencial cerca del Cimatario, ideal para construir a tu medida. Servicios completos a pie de lote y excelente conectividad.",
      features: ["Uso habitacional", "Servicios a pie de lote", "Frente amplio", "Zona en plusvalía", "Escrituras al corriente"],
      photos: ["1500382017468-9049fed747ef", "1441974231531-c6227db76b6e"],
    },
    {
      id: "penthouse-milenio", name: "Penthouse Milenio", op: "venta", tipo: "Departamento",
      zona: "Milenio III", ciudad: "Querétaro", price: 7400000,
      beds: 3, baths: 3, parking: 2, m2: 185,
      description: "Penthouse en el último nivel con terraza privada y vistas panorámicas de la ciudad. Amenidades de primer nivel y acabados de lujo en Milenio III.",
      features: ["Terraza privada", "Vista panorámica", "Doble estacionamiento", "Amenidades premium", "Bodega incluida"],
      photos: ["1493809842364-78817add7ffb", "1522708323590-d24dbb6b0267", "1505691938895-1758d7feb511"],
    },
    {
      id: "local-comercial-antea", name: "Local Comercial Antea", op: "renta", tipo: "Local",
      zona: "Antea", ciudad: "Querétaro", price: 32000,
      beds: 0, baths: 1, parking: 2, m2: 95,
      description: "Local comercial en zona de altísimo flujo cercana a Antea, con excelente exposición a pie de avenida. Perfecto para retail, alimentos o showroom.",
      features: ["Alto flujo peatonal", "Frente a avenida", "Baño incluido", "Cortina automática", "Estacionamiento amplio"],
      photos: ["1497366216548-37526070297c", "1524758631624-e2822e304c36", "1497215728101-856f4ea42174"],
    },
    {
      id: "casa-sabino", name: "Casa Sabino", op: "renta", tipo: "Casa",
      zona: "Zibatá", ciudad: "Querétaro", price: 38000,
      beds: 3, baths: 3, parking: 2, m2: 240,
      description: "Casa en renta dentro de un condominio privado en Zibatá, con acceso a club de golf y amenidades. Amplia, bien iluminada y en excelente estado.",
      features: ["Condominio privado", "Acceso a amenidades", "Jardín", "Cocina equipada", "Seguridad 24/7"],
      photos: ["1600047509807-ba8f99d2cdde", "1600566753086-00f18fb6b3ea", "1600607687939-ce8a6c25118c"],
    },
    {
      id: "terreno-juriquilla", name: "Terreno Juriquilla", op: "venta", tipo: "Terreno",
      zona: "Juriquilla", ciudad: "Querétaro", price: 2750000,
      beds: 0, baths: 0, parking: 0, m2: 320,
      description: "Terreno en condominio cerrado de Juriquilla, listo para construir. Entorno consolidado, seguridad y todos los servicios disponibles.",
      features: ["Condominio cerrado", "Servicios disponibles", "Terreno regular", "Amenidades del condominio", "Zona de alta plusvalía"],
      photos: ["1416339306562-f3d12fefd36f", "1441974231531-c6227db76b6e"],
    },
  ];
})();
