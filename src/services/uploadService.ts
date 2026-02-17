import { api } from "../api/axiosInstance";
import type { GalleryItem } from "../types/upload";

export const uploadService = {
  uploadFiles: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const { data } = await api.post("/upload/files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  },
  getRecentGallery: async (): Promise<GalleryItem[]> => {
    return [
      {
        id: "1",
        title: "Northern Ridge #102",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCltRg7l_fAFMygsodIj5pUw7qkHbAHRmkK9ctm7nXiZRPd4_nHss4eztGGiXatClSms_jIkBjZo-MdFyc2XuXpaWwi_WH9WqcAzs19Al4ctt5JaXX5FNf2ka-tvEIfzEX_pWk0Cnt-pVV1hEOA_ZYzhVjDwwu2gFOvCsyMg2B43GAKsPmZ3yGv0t5oM0Y4sfEYUEdDKX40zD-JkvcxV_bg2hL3SYtvu9PUon1itvPcJ8cqTg4akN6Cep9NK3cegARqZBN-skqQlWI",
        status: "trash-detected",
        gpsCoordinates: "44.5, -72.1",
        timestamp: "Oct 24, 2023 • 14:32 PM",
        metadataInfo: "Extracted (3 items)",
      },
      {
        id: "2",
        title: "River Basin Delta",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC1oMLyl3bGbp7F9Vooy3bux_yhTqXy7o0hxsxnVOQNmbQIOGV8Dxna6gr10AuGlUD4c6UxSU1_Bx6PTOoOmC6rzQsaxczfVYMIA4Qd7wsVexaFONe24e6baE0Yhwwj6RpWOkIOIctXsKMlIwmuU8VNx1Ap1MHjC9nCtSXCuGATzgu3bXfeqn4-r8SChjrGDfMVuO8ufz8-Z4Rxkb9ZhNvLgMpFVtLQEWGsMsptl47P3_Kr4mkBSNMmfONrAzQdpIZoPeMnqe-x5IA",
        status: "processing",
        gpsCoordinates: "44.2, -72.5",
        timestamp: "Oct 24, 2023 • 14:45 PM",
        metadataInfo: "Parsing...",
      },
      {
        id: "3",
        title: "Green Zone C-12",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD9pO_NewAzOKSSup7lab2CenMf5KdgJ1d-617S0fnOlGkOznN2kU0oUJ4pPaYQU-UG42lSXwdGhy1KP7Cy8T067RbEcHEavt0YVX3Y18gDjgTFPGsk-7DAH3R6ZmxHKz3E_zIrxW6Etn-5wj1bQvwu7gkQbJ9MkAT312iSt_S0JE65zhCnNAQ9WTECHoVQEXx2tT5LtHjvM9dE4G-qO86xuPJXliN0dQZUD_ppl4nZ65PaKtd1FbDzzRlD_3of1ZnJg94f86vGoOM",
        status: "clear",
        gpsCoordinates: "44.8, -71.9",
        timestamp: "Oct 23, 2023 • 09:12 AM",
        metadataInfo: "Extracted (5 items)",
      },
      {
        id: "4",
        title: "South Entrance Way",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD8m2i5ot-1WFDR8zg3yMF-nNQaK5gsGTCIw_pXdg9_642KFm06Bd3prNzfO5kntC1CDtLkazrJluCaRvIrdUlbQu47etSxsRCTRbqOSKMF5Iz0kZYEv9XMDwMgbuE3-XpWQ8o2K-_DeLDYmtDfj-7kltF-Y-3hDM0YPnrzrIprSDxSA57miK88ar5mqhhtd1m-ocQ0WHUsjaGe3gwTCi5slEcEYte2Yn05TpsGq8NhAIU2Nh1QESvix6LmiUG4T7lZmuDI86ufTjs",
        status: "trash-detected",
        gpsCoordinates: "44.1, -72.8",
        timestamp: "Oct 22, 2023 • 17:05 PM",
        metadataInfo: "Extracted (2 items)",
      },
    ];
  },
};
