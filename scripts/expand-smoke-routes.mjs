#!/usr/bin/env node
/**
 * DB-driven route expansion.
 *
 * Reads dynamic route patterns from src/App.tsx and expands `:param` segments
 * using real IDs / slugs fetched from Supabase (baked in below — refresh with
 * `bun scripts/expand-smoke-routes.mjs --refresh` once we wire the query).
 *
 * Output: src/utils/smokeTestRoutes.json (sorted, unique).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const APP = path.join(ROOT, "src/App.tsx");
const OUT = path.join(ROOT, "src/utils/smokeTestRoutes.json");

// ---------------------------------------------------------------------------
// Real samples fetched from Supabase (public/readable rows only). Kept small
// per bucket (10–100) so cartesian expansion stays under ~3000 routes total.
// ---------------------------------------------------------------------------
const S = {
  profile: ["06e9156b-de27-4045-b5b1-75f69c9835c3","e87a71bd-cf66-4e48-ad8a-5004a57e06b1","b5317107-f364-4c24-92ec-a7096803d763","a8924afa-c4f4-4edd-8357-89fdc3425f77","5f6c0fb2-35bc-4213-8d78-00535bc0a657","98dd5b3b-e9bf-472c-9804-649f2cf8ba81","e7d71c1c-6481-4bbf-9390-38b7487f814f","96cc8e5d-962f-45ca-8fc9-41502a2e8c9e","4905a974-24cb-4595-9600-158bcde42dc8","c6c1d803-6020-4d9f-b20f-43b49fa8396b","0ad77f90-652e-4f12-bcee-71aeb4542602","db984080-fda0-4f81-a84d-dd3f1318c9a7","3dc5121c-5aca-44ff-b753-2ff1bb4092a9","67f30e5e-8c35-4a53-aa46-139d8803894c","4c65538b-67c1-4aa1-9241-cbad0e19aa2c","e323dd32-1c34-47c8-bf6f-4b2ed03faf6e","5e064939-e080-474e-bf23-7f54d734c187","0ecb2db6-b21c-44be-a4c2-86cf48bae502","c83ac729-e3f0-4184-a4ef-e449a2435f86","fe248723-4dd5-4ed8-a391-49e84d985fa0","a7b4d74e-d19c-4582-bfa4-64e98cd95efd","0ac80f98-dd0b-4f2d-bec8-ad027aee832a","66591f15-7c00-44ab-94e2-73123d3da415","ef5094f5-dd90-4f96-9f7c-6e885aa7f3b9","3e292fc2-4c58-4399-8f8b-5dd4ea2675a5","97b94eb0-43aa-4507-b166-6468b9d624d9","fd94ae14-6107-4a01-9004-07630013b161","9dd2ec36-6ed3-4b9a-9dc3-fdb5cb945476","292cad1b-0e0e-448f-8004-53f384504c91","e1aaeac2-dff9-4adb-8872-2644c3987dbf","5cbd3a32-1a29-42c6-9843-124ece857aa3","c282c151-eed1-4bee-b6d3-18f5696e5cb1","ffd7eb2b-8827-4443-afc1-ea0c2a3150a3","b364c0d1-a813-407c-8097-79f3aefdd2ba","5d207e16-1a9f-4095-a76d-82aa549c62b0","001aeebb-90d0-4ba0-bfdd-74847d8538c4","cf0c3846-543a-4b53-b8d3-a6148b152fcd","34fd7b61-6e99-467a-a2b2-df9656bd61fd","9605f512-2aa9-4c35-8205-91e2e68aabb7","53b45271-a103-4b2c-9df7-70c36471dd0f","e169be4b-4e71-4c47-94aa-0c09a9a4410f","f3ebdaa9-f288-4c34-ba4e-ef96af7f3e38","beeeb84e-1c85-4ef0-a722-2f94c645955e","c65ce040-4035-4dc0-a1ce-163b72e08917","ce9802d4-8d4e-4410-a9dc-c5efa0d5e677","4e7bd0a1-290c-48bb-b4f9-ae999fd6d998","ea3229b3-2c45-42b0-8d61-433c6e9613f8","992ba2d5-7f98-4a59-a15b-80cb035029d8","141e2b03-2488-4379-8ff2-5947324465b2","6a83ab5a-75ff-42ed-a4e5-8ead1ea04b87","9e698811-55eb-4b1b-b5a5-56dbcc6326ac","aba75a91-55c9-4a44-8af9-9eeed847e036","fe818501-e526-4309-b0eb-5c8a66926a50","8793e911-0da5-4c27-98b2-7281a6f39a35","366817f9-136c-4ef0-820f-a53c26c12e5b","7afed18a-1554-41de-bca8-8c1f99f07486","8cfebe53-29aa-4fbe-a567-0599d81225be","4c85e9a0-b062-4e2b-9d4c-3464ded4c34b","a954906c-5ad9-451d-bc34-2e7945751ad1","232e7939-e36f-4105-bd1e-102a50c4775d","865f89b7-c1c3-45d2-aab1-d4c47e89a5fb","f1598a6c-cb0d-4aa1-b678-9eef45d675b8","3e4d73b6-ea60-4fec-acb7-3de5117c7b4a","3844d895-5af1-47ed-8fce-42576253dff3","97dcb181-9bed-4396-93f1-2ce13e0d6e13","23aca83c-0786-460c-a517-9a1b8374d04e","c12f8e87-ca62-4e96-a3c9-23731c79421f","8b955fde-e6ec-4295-b834-544ecec5ad0b","bca28cdc-4137-4cad-83cf-8254aa056830","f6091d6f-8307-4206-8b19-c2e542be9947","e63ad605-0fad-4e0e-8861-88641fc461fb","87ef1e1f-ab09-4542-9bf8-aec8145f3763","00a38cf8-5662-43f7-aada-9d28ab04333d","ed98dc4b-4554-480c-9560-e9419d5e6774","e9906643-32f8-413d-b1ea-90f7e695e196","009d43e0-1c9e-4646-adcc-b9a7bf051c02","e61ffe9f-c6fe-4b64-a23c-0366727ad2a9","100fed2a-2ddc-46f0-aaf2-c9a3a12cce8f","140a9809-0798-4c85-b77b-48f29dff4eff","1303643c-4aeb-458c-a9f7-0fd4cf84a7a6","75cb3f47-a5a5-47d9-89b8-6a17cb63e52d","9f076f95-c602-4982-853c-fcd6b1803d93","582409e3-e2c1-4b29-af42-279b559e2458","11d4b45a-10b7-458e-9e6e-87bc712db50a","58fc2f52-bdab-481a-8cbf-b726cd97d9be","43a72c6f-9b11-4c64-95bc-fece919d5ae0","01ac80ba-a465-45a0-82b8-1e6566ba072e","b065697b-43d8-4063-b437-decd72f559e1","ef3e8d87-db5c-48ff-ba06-12065ab20390","2c891978-2224-45cc-86a2-6cb9001498ca","5d3810ae-86d2-4206-9ba6-f9e75ffa3280","eb2549a7-db79-4ded-b515-61b43387260b","da21c287-9f39-4e52-be2c-1b5d3844cd80","a3c7e571-4a87-4be1-a380-7939c24c8b27","b1303417-f967-42b2-95f1-88926a5626ee","a58a11f7-1187-48e9-a870-1058eac97daf","94533ea2-5b65-480b-8f1e-27ff63184fca","fe0bec58-0888-42f7-ac31-577f379b5db9","49f5abdf-2ab9-4c88-999a-08b463a4a1c5","7de79973-1758-45f6-ae2f-dadb3f1e70af"],
  group: ["876385ae-d66a-46cf-933b-03f605781ea8","08b5cec7-5753-4b7d-bfb7-4ec6c2ce33a8","f21a1026-ecfe-4046-b68b-2b368d5898a7","127db3b9-4b7c-4824-a3b7-a0929495812b","ac5e819b-ea94-455e-be3f-7490e26cdae4","16ab5e58-228d-4dfc-8907-2ef0d3b16c13","319c4f4d-8c76-4e00-8dd3-8af570505b81","16a0eab8-aad1-43bc-a828-93e6c7c9de75","1104a3a3-3d9b-42ad-8d4e-23b9e0ef07dd","8f84fac1-1017-49cf-a0f3-1aa0b37d3d4d","9b8105f7-5d59-4dab-a407-ad551b3d4ab1","d38dc10d-849f-4ee7-8770-307553e44ee1","7ae527d7-e6e8-4e50-8592-18de9a54c27a","1833b410-5c01-46f9-82f3-8d3e0e5ec135","90bd466c-7b4d-4d0c-ae35-f66f178fad7a","f100eb19-588d-42c4-a49b-bee2c641a20b","89eb6aca-af37-426c-868d-6437e70fe322","72aabf2f-72e9-48e6-8fc3-4cfd42b6fd38","f3dccfcf-de05-4ed7-9de8-67b664974a08","7df0ae3a-7d46-480a-97dc-43a0f340690b","5abd9c49-5486-4535-b4bc-0cd2e8157e4a","f2adb9a9-ae4d-4653-b0b2-603d6bb9ad0b","18843405-e234-4251-a0fd-d9efaeab0706","b1ceea89-fe3d-4d91-8823-4a5af3e61197","2d6aa0a3-ce16-4fe2-9fa4-bab8078afdd0","ac000880-e300-4aea-a741-40d6b2cb8a49","a32b335c-7ef2-4c83-9540-3c6e8de9738a","381fa4d2-50cd-4351-ac88-100193cb0eef","c7cc48c4-fa4a-492b-b806-de7d19a2e853","1ff9daf6-88cb-484a-b400-e286168ad7d0","5c7f69b4-4088-4aa1-aec1-4d197e9d4c6a","1a78af2d-1478-462d-81b3-2ad6a0be86c5","9f68d5dd-d3ba-4788-9a34-540bb5e1508f","f223911d-6c3d-4029-8a7b-6ce20d12d3df","71fc189e-af19-4f06-bc00-4dbe5fad4feb","507ad199-5a5c-4998-89a5-3dc947617b9c","8eab15cb-4b55-47a8-983b-fe6a5e819995","5ce0c494-e024-4430-8975-2fd0288018f3","c0b7b315-9cb3-4fb9-b78a-801c225392e9","68b57739-c5a9-4b81-b0c2-4f216153c3d3","014b053d-7660-480e-a6d9-54bad0c826d1","620791f9-8c47-4eac-a2b8-910647fadaac","926e4e13-2ec8-4483-bf33-3031d1ed410f","0c0fdb22-0607-47bf-8202-ca3169cf6fd7","eefd532d-590f-4103-9e3c-315b198c1c09","c9e1faac-4dd2-43ed-a9cc-a8cc56767c2b","1f9f715e-9bd8-4500-914c-8a34dfde5d36","c8a6eed3-323e-4c3f-a09f-52bcdafa7cf2","4fdf1630-3906-43ed-95f3-cd4241eb1819"],
  event: ["9e63fba5-5bd8-452c-be49-3e54087b2a0b","a1a27868-a4ab-477f-a5b8-82036b5603d0","67db5c34-0eff-4334-b16d-734d45fcefd1","fa413edf-3fb5-4609-af83-9840f7132e91","5a985272-534e-45e8-a345-731935d5a480","6cfb3d5d-1f02-4792-b3a4-f192c099def3","aa376480-5400-410c-90cd-0e47126d65bf","4c602e39-2a74-477b-921d-69c09b4a5699","06fd4161-4537-408c-b21f-fb5967371f5d","1338f5ad-e021-4852-aa45-4b92b251c5e3","a974848b-6f93-4706-a92e-1e2dd587a400","c5d90898-329a-416a-b6bd-fedd4c6c9dc3","fc02e5ab-6c4b-4619-8d8e-8b1c7b538d20","4e5f42b1-d928-41e7-b515-94e84d0d9037","9dae9856-0489-4d31-905d-18871812da21","e39f3edf-29ff-43ab-b489-123b82d838e9","3c4ccb7a-8e2b-4b3f-adf8-54606f4a55d7","d7df60e6-34e6-45b4-9b7b-d97770a8dc0f","7b7b4f17-312e-4161-9566-a3e110c0e253","bdf588d4-3407-4d05-bc96-5a37834b28ce"],
  page: ["ec3f5b65-d26c-40e5-b534-3e2c37090915","73ef193a-1f7b-4779-bc07-845add3fc7bd","ab6c559e-0f3c-4d2c-a7dd-025926f72899","9b200d81-ea3e-419f-8566-c692f2532bfb","c6cc73fb-2af5-43a9-b83e-985a5d282662","c98eef41-a5bd-40af-ae55-ad86ba498fe2","a552f5a4-f548-4a27-8607-c1d2adaf2164","22dd9aa8-f86a-47b9-b609-60974dad192c","42cc08ee-a0f0-48c7-9a71-26178eb66a95","d37651ec-d12a-4414-9604-5f30a88a947f","407d85fa-a6e2-4342-a7b0-101a40b1e68c","5a122298-a008-42c0-891e-915397e2e4f5","3c8c1e3e-9206-489d-8f54-2faf870eda0d","a65e6883-69b2-41e6-baee-9bcb08771c4f"],
  quiz: ["173393f2-6987-4b07-9551-ec544d420d54","0a491cc2-4cec-458c-a0bf-6bf599cddd0c","b1496173-bfe9-441b-ab52-1a77fc6b3290","4a6cac4f-9d32-4a98-bd11-7318a492f953","10910222-8625-45c1-928d-ffaefaf8e2f8","6b1536b7-58e6-4555-9fcd-50ee55bf17f5","fe624668-e390-4c6d-9afd-631849a03ed5","ac62300a-781b-4019-ab10-f524427e356c","0ed97542-1f69-41e6-82fd-233f160dd839","d7208629-282c-48fe-b5cd-da009e1bc5da","b23b8058-b5be-40aa-b720-00c6c3c97d42","dc499b3b-547e-4025-99be-74173455491a","43871c20-71ab-4eea-b88e-6925172bf62e","96f6d99f-ce5e-4e39-812f-ee13e0afbdde","2d4653b1-260a-4686-b47c-4b66445227ae","7389dea3-f660-4aa3-8a4d-d01fb8987d65","306f680a-fe1d-48e8-9afd-76829cb325f0","27ce7dbf-8d58-4265-bebd-b47c68cde774","056dd58c-d7d6-4543-8fb3-15ce163bf14a","71c9d7f4-0dbf-4c82-8987-92663e424dbf","2a23d54b-1e26-4f3d-9e86-21c3316a565e","2d8f77db-41e9-456a-846d-b24f9d2feb91","ca58c80b-62ed-4995-90fe-e630b4a24019","69fe8314-5549-402d-8682-7796080b81d3","bcbda95c-4986-4c34-90a4-3730ffe7ed38","eac07f55-074d-47ae-85a1-7fae2e872e42","9de041f8-b7e1-46a7-bfb7-0d0fd2e56fe9","68c715b4-5494-4d37-a325-33e4a50f4ecf","0e3378df-0772-439e-a3e9-c18de23513ff","6caf98d9-2eed-4533-95b3-6733473e79a4","c4ae2b41-022e-4bdd-87ef-e89b9465f873","d6912ff1-ff84-40f4-8639-94de4d279e35","305b90a4-2446-4bea-be0b-9af5bb982a3f","db818790-6687-43b0-9f0d-b61e80d45935","62f2ba7a-8192-48a9-9cbc-d5f176bd04a2","d29f387c-ad42-4702-99df-584d91ceb394","779aa70c-3707-439c-aa27-66ad94bd07af","db3d8c62-c2db-4a01-88ca-55a01b690a84","8fdc7f2e-7312-431d-b2a2-aa30207efd47","f1684337-95aa-4fa2-a4c8-478ad1d66afe"],
  community: ["da9d7619-3f33-42d9-aa0e-7badbec71ed4","demo","1","2","test"],
  creator: ["eec4189b-c84c-4308-8a17-c8d1546936f1","demo","1","test"],
  concert: ["0d46571f-ea6e-4fd2-83b4-77f00e23da44","demo","1"],
  doctor: ["545f1501-f3a2-4588-9f89-45d96ea07256","demo","1"],
  megatalent_ls: ["25fe391d-a597-4f30-a7a9-d683bf9e2067","demo"],
  castle: ["0674f68a-5407-4dbf-9997-f6b139d81611","94fcae4b-6011-4119-8390-1cf2594e7594","2aec9d9f-20bc-40f9-a9db-a7aa8636be94","02797a66-7b4d-47f0-9c8f-80bd9dedb198","8b6f3a58-df8d-4e49-8b25-794d6bb2f07e","3c803403-43ca-4eb8-997b-c8145f55d5bd","412e3a5a-2a6d-42d6-8ba1-5308b3c531a1","576c1dcc-1894-41a8-9686-ddb4546738aa","5c3e12f7-5869-4ef4-9918-084dd5f77e1f","d60bcb41-1044-4d6b-8931-993aa4c08d42","ffa6c189-6726-4245-b3b9-0cb8496ec688","f67e89fa-2a35-4ed2-a598-d8378d3899e6"],
  kids_show: ["d02d9cce-11ef-4d95-9014-cd72901788ee","d593d56a-5c0f-4d0b-bae9-48ddd9d10d55","b2cfeb4f-2871-459e-837d-5bb85e78dc2e","7991be1b-d7f6-480c-bf12-ff8ede54cfbe","7df4487a-7190-4aca-8981-d8154c5d4605","56ea7694-276a-4d58-bc0f-74c878370d32","797a5906-8805-4364-aa04-80500b480654","a9245d7c-8816-48de-a62a-4bb17355063e","7d39176e-9d26-47c8-b9ce-521627130654","eb942311-0f19-47d8-a4a8-c410b3152cfa","57382526-f7cb-4963-94ec-c5145d0f5048","043e70d3-917f-4f1b-a449-e032cf1415c8","31c9f2ea-7170-43c4-aed0-604e7bcb0df4","7cfcacd8-1538-452c-a41b-0ad27dcbca15","5b7b5ac0-51fe-4526-9a80-978cdfe6c4ff","71f98f56-faff-429e-9d9e-31778406f2f3","f8cb0347-3ce5-4133-b9a7-48f3030ff372","2b633cb9-ac22-46b7-b63c-10130308b1a0","224b7cbb-d884-419b-8674-c5e707026e9d","c929d99e-ebbd-4c8b-8926-12cf0979fca9"],
  job_slug: ["e2e-test-listing-000000","senior-full-stack-developer-a1cfbc","hotel-receptionist-fr-en-97bd2e","react-frontend-engineer-60ef63","devops-sre-87cf6d","junior-python-developer-818141","ios-developer-swift-f02df7","performance-marketing-manager-0c586a","saas-account-executive-ecfffd","content-seo-specialist-d6bfda","head-of-growth-cfccf0","senior-accountant-ifrs-60aebd","financial-controller-c4eb63","junior-tax-consultant-a8b782","fp-a-analyst-3d05ee","registered-nurse-icu-05d765","dental-hygienist-e68ddb","clinical-psychologist-862d73","pharmacist-8ac66b","english-teacher-cefr-c1-e5803e","math-tutor-online-aa2f06","kindergarten-teacher-14b636","e-learning-curriculum-designer-346de6","mechanical-design-engineer-cad-aa9384","electrical-engineer-automotive-1938f5","qa-engineer-iso-9001-8074b6","civil-engineer-0a6dde","sous-chef-36bd56","bartender-cocktail-bar-8cd68e","spa-wellness-manager-a72977","store-manager-b26442","e-commerce-operations-specialist-fd28b6","visual-merchandiser-a75c27","customer-support-agent-sk-en-29c3bd","production-line-supervisor-3e8c83","cnc-operator-592652","site-foreman-539e56","international-truck-driver-ce-0c43cd","logistics-coordinator-8b456f"],
  company_slug: ["e2e-test-company-xf2g","demo","test"],
  demo: ["demo","1","2","test","preview"],
};

// content-heavy dynamic content ids reuse a shared bucket
const CONTENT_IDS = ["demo","1","2","3","4","5","test","preview","hero","featured","new","top","latest","sample","alpha","beta","gamma","delta","epsilon","zeta","eta","theta","iota","kappa","lambda"];

// Map :param name -> sample bucket. Multi-token names get scored by suffix.
function samplesFor(paramName, pathHint) {
  const p = paramName.toLowerCase();
  const h = pathHint.toLowerCase();
  if (p === "userid" || p === "username") return S.profile.slice(0, 20);
  if (p === "creatorid") return [...S.creator, ...S.profile.slice(0, 8)];
  if (p === "groupid") return S.group;
  if (p === "eventid") return S.event;
  if (p === "pageid") return S.page;
  if (p === "quizid") return S.quiz.slice(0, 20);
  if (p === "communityid" || p === "id" && h.includes("/community")) return S.community;
  if (p === "showid" && h.includes("kids")) return S.kids_show;
  if (p === "showid" && h.includes("comedy")) return [...S.demo];
  if (p === "castleid") return S.castle;
  if (p === "streamid") return [...S.megatalent_ls, ...S.demo];
  if (p === "appointmentid" || p === "bookingid") return S.demo;
  if (p === "slug" && h.includes("/jobs/")) return S.job_slug.slice(0, 20);
  if (p === "slug" && h.includes("/companies/")) return S.company_slug;
  if (p === "slug") return CONTENT_IDS;
  if (p === "contentid") return CONTENT_IDS;
  if (p === "courseid") return CONTENT_IDS;
  if (p === "id" && h.includes("/wall/")) {
    if (h.includes("group")) return S.group;
    if (h.includes("event")) return S.event;
    if (h.includes("page")) return S.page;
  }
  if (p === "id" && h.includes("/post/")) return CONTENT_IDS;
  if (p === "id" && h.includes("/profile")) return S.profile.slice(0, 20);
  if (p === "id" && h.includes("/skills-marketplace")) return CONTENT_IDS;
  if (p === "id" && h.includes("/doctors")) return [S.doctor[0], ...CONTENT_IDS];
  if (p === "id" && h.includes("/services")) return CONTENT_IDS;
  if (p === "id" && h.includes("/megatalent")) return [...S.megatalent_ls, ...CONTENT_IDS];
  if (p === "id" && h.includes("/community/")) return S.community;
  if (p === "id" && h.includes("/live/")) return [...S.megatalent_ls, ...CONTENT_IDS];
  if (p === "id" && (h.includes("/dream") || h.includes("/hero") || h.includes("/medical") || h.includes("/crisis") || h.includes("/pet") || h.includes("/student") || h.includes("/talent"))) return CONTENT_IDS;
  if (p === "category") return ["singing","dancing","comedy","talent","music","art","sports","tech"];
  if (p === "feature" && h.includes("/ai-mentor/tools")) return ["memory","skills","personality","roleplay","cbt","coach","feedback","goals","habits","nudges","reflections","summaries","voice-journal"];
  if (p === "area" && h.includes("/ai-mentor")) return ["career","fitness","mindset","relationships"];
  if (p === "area" || p === "feature" || p === "subject") return CONTENT_IDS;
  if (p === "code" || p === "token" || p === "sharecode") return CONTENT_IDS;
  if (p === "campaigntype") return ["dream","medical","hero","crisis","pet","student","talent"];
  if (p === "campaignid") return CONTENT_IDS;
  if (p === "donationid" || p === "orderid" || p === "battleid" || p === "storyid") return CONTENT_IDS;
  if (p === "deckid") return CONTENT_IDS;
  if (p === "conversationid") return CONTENT_IDS;
  if (p === "certificationid" || p === "coursename" || p === "masterclassid") return CONTENT_IDS;
  if (p === "jobid") return CONTENT_IDS;
  if (p === "brand") return ["nike","amazon","zalando","apple","zara","hm","adidas","asos","ebay","alza","mall","tesco","alza-sk","zoot","booking","airbnb"];
  if (p === "tournamentid") return CONTENT_IDS;
  return CONTENT_IDS.slice(0, 6);
}

function extractDynamicRoutes(src) {
  const routes = new Set();
  const re = /<Route[^>]*\spath\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(src))) {
    let p = m[1];
    if (!p.startsWith("/")) p = "/" + p;
    if (p.includes(":")) routes.add(p);
  }
  return [...routes];
}

function extractStaticRoutes(src) {
  const routes = new Set();
  const re = /<Route[^>]*\spath\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(src))) {
    let p = m[1];
    if (!p.startsWith("/")) p = "/" + p;
    if (!p.includes(":") && !p.includes("*")) routes.add(p);
  }
  return [...routes];
}

function expandOne(pattern, samplesBySeg) {
  // Cartesian product for multi-segment dynamic routes, capped.
  const segs = pattern.split("/");
  let out = [""];
  for (const seg of segs) {
    if (!seg.startsWith(":")) {
      out = out.map((p) => p + "/" + seg);
      continue;
    }
    const paramName = seg.replace(/[?:]/g, "");
    const optional = seg.endsWith("?");
    const bucket = samplesFor(paramName, pattern);
    const values = bucket.slice(0, optional ? 6 : 25);
    const next = [];
    for (const p of out) {
      for (const v of values) next.push(p + "/" + encodeURIComponent(v));
      if (optional) next.push(p);
    }
    out = next;
    if (out.length > 200) out = out.slice(0, 200); // per-pattern cap
  }
  return out.map((p) => p.replace(/^\/+/, "/"));
}

function main() {
  const src = fs.readFileSync(APP, "utf8");
  const staticRoutes = extractStaticRoutes(src);
  const dynamic = extractDynamicRoutes(src);

  const all = new Set(staticRoutes);
  for (const pat of dynamic) {
    for (const url of expandOne(pat, {})) all.add(url);
  }
  // Preserve any hand-added routes already in the JSON.
  try {
    const existing = JSON.parse(fs.readFileSync(OUT, "utf8"));
    for (const r of existing) all.add(r);
  } catch {}

  const sorted = [...all].sort();
  fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`Wrote ${sorted.length} routes → ${OUT}`);
  console.log(`  static: ${staticRoutes.length}`);
  console.log(`  dynamic patterns: ${dynamic.length}`);
}

main();
