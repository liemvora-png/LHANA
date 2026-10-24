const imageBase = "https://images.squarespace-cdn.com/content/v1/648655437ada6936d47995e8/";

function projectImages(name, images) {
  return images.map(([path, filename], index) => ({
    src: `${imageBase}${path}/${filename}?format=1400w`,
    alt: `${name} interior design project, photograph ${index + 1}`,
  }));
}

window.lhanaProjects = [
  {
    slug: "portsmouth",
    name: "Portsmouth",
    type: "Residential",
    description: "A warm, collected home in Portsmouth.",
    images: projectImages("Portsmouth", [
      ["fc857082-b91f-4967-8b53-485b6c11febe", "DSC_3224.JPG"],
      ["505eb10f-4a47-47df-897b-a21bd2bbee0d", "DSC_3132.JPG"],
      ["d8545ada-2efc-4ca5-82dd-351ccdaa1848", "Portsmouth+1964+167_8_9.jpg"],
      ["58b909c1-c999-4137-9d1c-5e43543d9f07", "DSC_2784+%281%29.JPG"],
    ]),
  },
  {
    slug: "waverly",
    name: "Waverly",
    type: "Residential",
    description: "A bright and inviting residential interior.",
    images: projectImages("Waverly", [
      ["a6fe229f-787c-461d-b408-1987a0696c44", "Screen+Shot+2023-06-12+at+5.23.37+PM.png"],
      ["a7e21ad8-f5f9-46df-8efd-7aa10c9bc98b", "Screen+Shot+2023-06-12+at+5.24.04+PM.png"],
      ["f945eb1e-e96c-4a64-a793-6598df6f087d", "Screen+Shot+2023-06-12+at+5.24.27+PM.png"],
      ["5db940ff-d793-4eee-9372-0360a2576618", "Screen+Shot+2023-06-12+at+5.24.55+PM.png"],
    ]),
  },
  {
    slug: "kumon-spring-valley",
    name: "Kumon Spring Valley",
    type: "Commercial",
    description: "A welcoming learning center designed for everyday discovery.",
    images: projectImages("Kumon Spring Valley", [
      ["faa626f3-b3d1-40f8-99c6-241c0551f5f7", "DSC_2125.jpg"],
      ["cef8943e-e437-44bd-986c-5c21a31ee4f8", "DSC_2130.jpg"],
      ["309d5c53-ddde-4157-84f4-da8010057428", "DSC_2137.jpg"],
      ["8a1af5bc-9c1b-434a-b449-dd73ed0d6d79", "DSC_2145.jpg"],
    ]),
  },
  {
    slug: "kipling",
    name: "Kipling",
    type: "Residential",
    description: "A thoughtful home with room to gather.",
    images: projectImages("Kipling", [
      ["037d04e5-5a19-42d1-8504-f08f307aa160", "Screen+Shot+2023-06-13+at+12.20.10+PM.png"],
      ["33a32018-1d3c-4beb-8002-659901459444", "Screen+Shot+2023-06-13+at+12.20.31+PM.png"],
      ["0e760ddd-7fb3-4f1c-9a10-15de9c6ceabf", "Screen+Shot+2023-06-13+at+12.20.50+PM.png"],
      ["c85b9696-5564-4dd4-a0e7-3cb8aa6668fb", "Screen+Shot+2023-06-13+at+12.22.11+PM.png"],
    ]),
  },
  {
    slug: "braesmont",
    name: "Braesmont",
    type: "Residential",
    description: "A home shaped around welcoming dining spaces.",
    images: projectImages("Braesmont", [
      ["41b81ae3-fa48-4673-acec-800925eeca2e", "Screen+Shot+2023-06-12+at+4.28.01+PM.png"],
      ["73f16358-1e85-4219-8a22-7271f618215d", "Screen+Shot+2023-06-12+at+4.28.18+PM.png"],
      ["21b62c82-e45f-40e4-8210-f6a082498f3d", "Screen+Shot+2023-06-12+at+4.28.33+PM.png"],
      ["9f404efb-314c-4349-b108-109b4c4d5e70", "Screen+Shot+2023-06-12+at+4.28.48+PM.png"],
    ]),
  },
  {
    slug: "bering-drive",
    name: "Bering Drive",
    type: "Residential",
    description: "A comfortable, considered family home.",
    images: projectImages("Bering Drive", [
      ["9e1ec04b-4581-4b3e-9053-a0d406eb2307", "Screen+Shot+2023-06-18+at+9.13.32+AM.png"],
      ["90916ae6-efbc-406c-970c-b9be1e10e91c", "DSC_3227.JPG"],
      ["cdb651e8-7fc7-4691-97d4-de013830f23b", "DSC_3229.JPG"],
      ["e2d045f8-fd56-4e2e-8c8b-4425ae51d1b2", "DSC_3230.JPG"],
    ]),
  },
  {
    slug: "juniper-pines",
    name: "Juniper Pines",
    type: "Residential",
    description: "Natural textures and easy gathering spaces.",
    images: projectImages("Juniper Pines", [
      ["421c0801-037a-4698-83f7-248d77e7ca5e", "Screen+Shot+2023-06-12+at+4.19.37+PM.png"],
      ["8d663406-8c74-4d78-b303-ccbb8fdad1e3", "Screen+Shot+2023-06-12+at+4.18.56+PM.png"],
      ["cc66ef98-2c7e-4bd1-be9a-b8e85869760b", "Screen+Shot+2023-06-12+at+4.19.17+PM.png"],
      ["c1cca11e-b303-4945-8a27-f09507f5b6d8", "Screen+Shot+2023-06-12+at+4.34.33+PM.png"],
    ]),
  },
  {
    slug: "cordell",
    name: "Cordell",
    type: "Residential",
    description: "A relaxed, personal residential interior.",
    images: projectImages("Cordell", [
      ["9a8c9da1-5891-4d5a-abc2-9916f1f1b43b", "Screen+Shot+2023-06-12+at+4.05.22+PM.png"],
      ["754ee58d-6cb7-4445-a466-b51cf2dd9bb5", "Screen+Shot+2023-06-12+at+4.03.04+PM.png"],
      ["1849c209-6713-4fab-bc01-a81d1a365a5d", "Screen+Shot+2023-06-12+at+4.03.21+PM.png"],
      ["2dbf48ca-6dfe-4269-8716-a3e373aebbdf", "Screen+Shot+2023-06-12+at+4.04.14+PM.png"],
    ]),
  },
  {
    slug: "dover",
    name: "Dover",
    type: "Residential",
    description: "A welcoming home with timeless details.",
    images: projectImages("Dover", [
      ["a69ba98a-87b0-46de-b96e-ac0ad4a2ab8e", "Screen+Shot+2023-06-11+at+10.46.24+PM.png"],
      ["89a8e808-a742-4807-96dc-5e5a315d64e5", "Screen+Shot+2023-06-11+at+10.52.35+PM.png"],
      ["b33c2bb0-737c-4669-a238-83c63c9c95d3", "Screen+Shot+2023-06-12+at+4.24.33+PM.png"],
      ["e9c4ac41-ae82-4744-ae1b-3babc76aba7a", "Screen+Shot+2023-06-13+at+12.23.20+PM.png"],
    ]),
  },
  {
    slug: "allston",
    name: "Allston",
    type: "Study & lounge",
    description: "A calm, flexible study and lounge.",
    images: projectImages("Allston", [
      ["42551be7-13a4-47e7-a43a-91a86db52260", "DSC_2512.jpg"],
      ["9ffcb2d7-831f-43d2-a357-f8388a8c55bc", "DSC_2513.jpg"],
      ["a6c3ca14-55cf-48cd-b43b-30d77a950c7c", "DSC_2515.jpg"],
      ["fa1d0f62-1741-4459-8af2-a3610b5eaa7f", "DSC_2520.jpg"],
    ]),
  },
  {
    slug: "lehigh",
    name: "Lehigh",
    type: "Kitchen & living",
    description: "An open kitchen and living space.",
    images: projectImages("Lehigh", [
      ["1686603720805-3SW9CVE2YXX1C1QK42JU", "Screen+Shot+2023-06-12+at+3.45.49+PM.png"],
      ["21485063-5acb-4fe3-b4ed-e0dc0291dd74", "Screen+Shot+2023-06-12+at+3.46.25+PM.png"],
      ["2748c616-5107-4ec0-8baf-369cf90bbf1b", "Screen+Shot+2023-06-12+at+3.45.49+PM.png"],
      ["9a3f35c8-9786-47b9-ab9e-26a9673a5e4b", "Screen+Shot+2023-06-12+at+3.44.35+PM.png"],
    ]),
  },
  {
    slug: "garden",
    name: "Garden",
    type: "Outdoor living",
    description: "A garden made for spending time outdoors.",
    images: projectImages("Garden", [
      ["601ca267-d0c1-4f08-abee-c6b937d11f29", "DSC_1296.JPG"],
      ["005f1020-812f-4111-bdf3-36ebf91c7655", "DSC_1280.JPG"],
      ["cfa6cadf-6f42-478c-9032-581bd4d1e81e", "DSC_1290.JPG"],
      ["f80b8c2e-284b-486e-a26c-c2df4cb26e24", "DSC_1283.JPG"],
    ]),
  },
  {
    slug: "cedar-creek",
    name: "Cedar Creek",
    type: "Residential",
    description: "A home with thoughtfully layered living and dining spaces.",
    images: projectImages("Cedar Creek", [
      ["ac160190-ce7a-4dc3-99cc-0313c1ec4d3e", "DSC_8683.JPG"],
      ["941cd3f5-bbfd-48e2-b3d6-516fe100cc0b", "DSC_8696.JPG"],
      ["8fc37a3d-6e6c-4490-a810-da6e16a0ca7e", "DSC_0663.JPG"],
      ["1686541423573-SAP29LG06OB9ORYNKSFN", "DSC_6917.JPG"],
    ]),
  },
  {
    slug: "tannehill",
    name: "Tannehill",
    type: "Residential",
    description: "A warm and inviting residential project.",
    images: projectImages("Tannehill", [
      ["c3f86b4b-23d8-4fd3-9f44-761bda112a53", "DSC_0550.JPG"],
      ["2819849f-198a-40f1-97fb-59f20a2cb031", "DSC_0551.JPG"],
      ["e3c2c759-cd08-47de-a4dc-0deba7ac3da4", "DSC_0552.JPG"],
      ["f7d028c4-edfe-4e77-9193-2ee9d3c5594f", "IMG_7818.jpg"],
    ]),
  },
  {
    slug: "columbia",
    name: "Columbia",
    type: "Attic & dining renovation",
    description: "Attic and dining room renovations with considered details.",
    images: projectImages("Columbia", [
      ["99c1e350-2ea7-4e86-985e-b3b2c72c9468", "DSC_3179.jpg"],
      ["e6a52d59-5140-4d0d-92ee-1ae22857a56d", "DSC_3191.jpg"],
      ["46ef1685-bcb7-435c-964d-9ee22ab794a5", "DSC_3192.jpg"],
      ["ffa73921-1b4b-4e77-8aa2-77b4cd431413", "DSC_3152+%281%29.jpg"],
    ]),
  },
  {
    slug: "mccue",
    name: "McCue",
    type: "Residential",
    description: "A collected home with a warm, lived-in feel.",
    images: projectImages("McCue", [
      ["54d16c5c-875b-4668-988f-9afe6c18cbf9", "DSC_4600.jpg"],
      ["ab64e67d-838e-4ab5-b64b-b1b6c37df219", "DSC_4616.jpg"],
      ["853f56f6-13aa-41ec-bee9-59d7f5311b5f", "DSC_4627.jpg"],
      ["4deb2694-efaf-4071-82c9-680981ad3e99", "DSC_4635.JPG"],
    ]),
  },
  {
    slug: "annapolis",
    name: "Annapolis",
    type: "Residential",
    description: "A comfortable home with a light, welcoming palette.",
    images: projectImages("Annapolis", [
      ["2a0ab436-153f-44e8-bd47-678d4439d768", "Screen+Shot+2023-06-12+at+8.25.13+AM.png"],
      ["d79f4028-849b-4814-a63c-193655012684", "Screen+Shot+2023-06-12+at+8.26.43+AM.png"],
      ["7d06d83b-8bb9-44d1-9ffc-e7a907d426c6", "Screen+Shot+2023-06-12+at+8.27.41+AM.png"],
      ["d165eed5-8bb8-431f-afc5-5051eae3aa3c", "Screen+Shot+2023-06-14+at+10.02.55+PM.png"],
    ]),
  },
  {
    slug: "bluebonnet",
    name: "Bluebonnet",
    type: "Kitchen & bath",
    description: "A home refreshed with considered kitchen and bath details.",
    images: projectImages("Bluebonnet", [
      ["3b66acb6-1f61-48a5-b207-dc04d8904af5", "DSC_1682.jpg"],
      ["73a3dfb5-1534-4b3d-9cd5-073708d3452e", "DSC_1656.jpg"],
      ["54c254ab-2a5f-4838-9f64-657b2bcdf777", "DSC_1688.jpg"],
      ["f2e6eaec-18e3-437f-99b5-b5c8ae44080d", "DSC_1653.jpg"],
    ]),
  },
  {
    slug: "maple",
    name: "Maple",
    type: "Residential",
    description: "A family home with a personal, relaxed style.",
    images: projectImages("Maple", [
      ["65358c9f-b2e2-4b8a-bf68-4eb3b691ac53", "Screen+Shot+2023-06-11+at+10.32.05+PM.png"],
      ["e5fd377a-c9b5-4cea-be1f-f34234fec7f6", "Screen+Shot+2023-06-11+at+10.30.15+PM.png"],
      ["9bdcdc73-2d01-45fb-890c-1ef48974ef09", "DSC_1118.JPG"],
      ["d9c0a749-8040-4ed4-a4d8-01787b2195fa", "DSC_9038.JPG"],
    ]),
  },
];

window.lhanaDefaultProjects = window.lhanaProjects;
window.lhanaContentReady = fetch("/api/content", {
  headers: { Accept: "application/json" },
}).then(async (response) => {
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Site content could not be loaded.");
  if (!Array.isArray(result.projects)) throw new Error("The server returned an incomplete project list.");
  window.lhanaSiteContent = result.site;
  window.lhanaProjects = result.projects.map((project) => ({
    ...project,
    images: project.images.map((image) => ({
      ...image,
      src: image.url,
      alt: image.altText,
    })),
  }));
}).catch((error) => {
  console.error("Failed to refresh public LHANA projects:", error);
  const notice = document.querySelector("#content-update-notice");
  if (notice) {
    notice.textContent = "Live content is temporarily unavailable. Showing the latest portfolio copy saved with this page.";
    notice.hidden = false;
  }
});
