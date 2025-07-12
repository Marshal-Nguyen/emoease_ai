import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export const DataContext = createContext();
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  // State lưu trữ dữ liệu dùng chung
  const [emotions, setEmotions] = useState([]);
  const [improvementGoals, setImprovementGoals] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [industryTotal, setIndustryTotal] = useState(0);
  const [industryPage, setIndustryPage] = useState(1);
  const [foodActivities, setFoodActivities] = useState([]);
  const [foodTotal, setFoodTotal] = useState(0);
  const [foodPage, setFoodPage] = useState(1);
  const [physicalActivities, setPhysicalActivities] = useState([]);
  const [physicalTotal, setPhysicalTotal] = useState(0);
  const [physicalPage, setPhysicalPage] = useState(1);
  const [therapeuticActivities, setTherapeuticActivities] = useState([]);
  const [therapeuticTotal, setTherapeuticTotal] = useState(0);
  const [therapeuticPage, setTherapeuticPage] = useState(1);
  const [entertainmentActivities, setEntertainmentActivities] = useState([]);
  const [entertainmentTotal, setEntertainmentTotal] = useState(0);
  const [entertainmentPage, setEntertainmentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMoreEntertainment, setIsLoadingMoreEntertainment] =
    useState(false);
  const [isLoadingMoreFood, setIsLoadingMoreFood] = useState(false);
  const [isLoadingMorePhysical, setIsLoadingMorePhysical] = useState(false);
  const [isLoadingMoreTherapeutic, setIsLoadingMoreTherapeutic] =
    useState(false);
  const [isLoadingMoreIndustry, setIsLoadingMoreIndustry] = useState(false);

  // Supabase config
  const SUPABASE_URL = "https://oqoundglstrviiuyvanl.supabase.co/rest/v1";
  const SUPABASE_API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Fetch all emotions
  const fetchAllEmotions = useCallback(async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/Emotions?select=*`, {
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_API_KEY,
        },
      });
      if (!res.ok) {
        console.error("fetchAllEmotions failed:", res.status, await res.text());
        return [];
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("fetchAllEmotions error:", err);
      return [];
    }
  }, [SUPABASE_URL, SUPABASE_API_KEY]);

  // Fetch all improvement goals
  const fetchAllImprovementGoals = useCallback(async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/ImprovementGoals?select=*`, {
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_API_KEY,
        },
      });
      if (!res.ok) {
        console.error(
          "fetchAllImprovementGoals failed:",
          res.status,
          await res.text()
        );
        return [];
      }
      const data = await res.json();
      return data.map((goal) => ({
        value: goal.Id,
        label: goal.Name,
        description: goal.Description,
      }));
    } catch (err) {
      console.error("fetchAllImprovementGoals error:", err);
      return [];
    }
  }, [SUPABASE_URL, SUPABASE_API_KEY]);

  // Fetch entertainment activities (Supabase, phân trang)
  const fetchEntertainmentPage = useCallback(
    async (page = 1, pageSize = 10) => {
      try {
        const offset = (page - 1) * pageSize;
        const res = await fetch(
          `${SUPABASE_URL}/EntertainmentActivities?select=*&order=Name.asc&limit=${pageSize}&offset=${offset}`,
          {
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_API_KEY,
              Prefer: "count=exact",
            },
          }
        );
        if (!res.ok) {
          console.error(
            "fetchEntertainmentPage failed:",
            res.status,
            await res.text()
          );
          return { data: [], total: 0 };
        }
        const data = await res.json();
        // Lấy tổng số bản ghi từ Content-Range header
        const contentRange = res.headers.get("Content-Range");
        let total = 0;
        if (contentRange) {
          // VD: "0-9/23"
          const match = contentRange.match(/\/(\d+)$/);
          if (match) total = parseInt(match[1], 10);
        }
        return { data, total };
      } catch (err) {
        console.error("fetchEntertainmentPage error:", err);
        return { data: [], total: 0 };
      }
    },
    [SUPABASE_URL, SUPABASE_API_KEY]
  );

  // Fetch food activities (Supabase, phân trang)
  const fetchFoodPage = useCallback(
    async (page = 1, pageSize = 10) => {
      try {
        const offset = (page - 1) * pageSize;
        const res = await fetch(
          `${SUPABASE_URL}/FoodActivities?select=*&order=Name.asc&limit=${pageSize}&offset=${offset}`,
          {
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_API_KEY,
              Prefer: "count=exact",
            },
          }
        );
        if (!res.ok) {
          console.error("fetchFoodPage failed:", res.status, await res.text());
          return { data: [], total: 0 };
        }
        const data = await res.json();
        const contentRange = res.headers.get("Content-Range");
        let total = 0;
        if (contentRange) {
          const match = contentRange.match(/\/(\d+)$/);
          if (match) total = parseInt(match[1], 10);
        }
        return { data, total };
      } catch (err) {
        console.error("fetchFoodPage error:", err);
        return { data: [], total: 0 };
      }
    },
    [SUPABASE_URL, SUPABASE_API_KEY]
  );

  // Fetch physical activities (Supabase, phân trang)
  const fetchPhysicalPage = useCallback(
    async (page = 1, pageSize = 10) => {
      try {
        const offset = (page - 1) * pageSize;
        const res = await fetch(
          `${SUPABASE_URL}/PhysicalActivities?select=*&order=Name.asc&limit=${pageSize}&offset=${offset}`,
          {
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_API_KEY,
              Prefer: "count=exact",
            },
          }
        );
        if (!res.ok) {
          console.error(
            "fetchPhysicalPage failed:",
            res.status,
            await res.text()
          );
          return { data: [], total: 0 };
        }
        const data = await res.json();
        const contentRange = res.headers.get("Content-Range");
        let total = 0;
        if (contentRange) {
          const match = contentRange.match(/\/(\d+)$/);
          if (match) total = parseInt(match[1], 10);
        }
        return { data, total };
      } catch (err) {
        console.error("fetchPhysicalPage error:", err);
        return { data: [], total: 0 };
      }
    },
    [SUPABASE_URL, SUPABASE_API_KEY]
  );

  // Fetch therapeutic activities (Supabase, phân trang)
  const fetchTherapeuticPage = useCallback(
    async (page = 1, pageSize = 10) => {
      try {
        const offset = (page - 1) * pageSize;
        const res = await fetch(
          `${SUPABASE_URL}/TherapeuticActivities?select=*&order=Name.asc&limit=${pageSize}&offset=${offset}`,
          {
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_API_KEY,
              Prefer: "count=exact",
            },
          }
        );
        if (!res.ok) {
          console.error(
            "fetchTherapeuticPage failed:",
            res.status,
            await res.text()
          );
          return { data: [], total: 0 };
        }
        const data = await res.json();
        const contentRange = res.headers.get("Content-Range");
        let total = 0;
        if (contentRange) {
          const match = contentRange.match(/\/(\d+)$/);
          if (match) total = parseInt(match[1], 10);
        }
        return { data, total };
      } catch (err) {
        console.error("fetchTherapeuticPage error:", err);
        return { data: [], total: 0 };
      }
    },
    [SUPABASE_URL, SUPABASE_API_KEY]
  );

  // Fetch industries (Supabase, phân trang)
  const fetchIndustryPage = useCallback(
    async (page = 1, pageSize = 10) => {
      try {
        const offset = (page - 1) * pageSize;
        const res = await fetch(
          `${SUPABASE_URL}/Industries?select=*&order=IndustryName.asc&limit=${pageSize}&offset=${offset}`,
          {
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_API_KEY,
              Prefer: "count=exact",
            },
          }
        );
        if (!res.ok) {
          console.error(
            "fetchIndustryPage failed:",
            res.status,
            await res.text()
          );
          return { data: [], total: 0 };
        }
        const data = await res.json();
        const contentRange = res.headers.get("Content-Range");
        let total = 0;
        if (contentRange) {
          const match = contentRange.match(/\/(\d+)$/);
          if (match) total = parseInt(match[1], 10);
        }
        return { data, total };
      } catch (err) {
        console.error("fetchIndustryPage error:", err);
        return { data: [], total: 0 };
      }
    },
    [SUPABASE_URL, SUPABASE_API_KEY]
  );

  // Load more entertainment (phân trang)
  const loadMoreEntertainment = useCallback(async () => {
    if (isLoadingMoreEntertainment) return;
    setIsLoadingMoreEntertainment(true);
    const nextPage = entertainmentPage + 1;
    const { data } = await fetchEntertainmentPage(nextPage, 10);
    setEntertainmentActivities((prev) => [
      ...prev,
      ...data.map((item) => ({
        value: item.Id,
        label: item.Name,
        description: item.Description,
        intensityLevel: item.IntensityLevel,
        impactLevel: item.ImpactLevel,
      })),
    ]);
    setEntertainmentPage(nextPage);
    setIsLoadingMoreEntertainment(false);
  }, [entertainmentPage, fetchEntertainmentPage, isLoadingMoreEntertainment]);

  // Load more food (phân trang)
  const loadMoreFood = useCallback(async () => {
    if (isLoadingMoreFood) return;
    setIsLoadingMoreFood(true);
    const nextPage = foodPage + 1;
    const { data } = await fetchFoodPage(nextPage, 10);
    setFoodActivities((prev) => [
      ...prev,
      ...data.map((item) => ({
        value: item.Id,
        label: item.Name,
        description: item.Description,
        intensityLevel: item.IntensityLevel,
        impactLevel: item.ImpactLevel,
      })),
    ]);
    setFoodPage(nextPage);
    setIsLoadingMoreFood(false);
  }, [foodPage, fetchFoodPage, isLoadingMoreFood]);

  // Load more physical (phân trang)
  const loadMorePhysical = useCallback(async () => {
    if (isLoadingMorePhysical) return;
    setIsLoadingMorePhysical(true);
    const nextPage = physicalPage + 1;
    const { data } = await fetchPhysicalPage(nextPage, 10);
    setPhysicalActivities((prev) => [
      ...prev,
      ...data.map((item) => ({
        value: item.Id,
        label: item.Name,
        description: item.Description,
        intensityLevel: item.IntensityLevel,
        impactLevel: item.ImpactLevel,
      })),
    ]);
    setPhysicalPage(nextPage);
    setIsLoadingMorePhysical(false);
  }, [physicalPage, fetchPhysicalPage, isLoadingMorePhysical]);

  // Load more therapeutic (phân trang)
  const loadMoreTherapeutic = useCallback(async () => {
    if (isLoadingMoreTherapeutic) return;
    setIsLoadingMoreTherapeutic(true);
    const nextPage = therapeuticPage + 1;
    const { data } = await fetchTherapeuticPage(nextPage, 10);
    setTherapeuticActivities((prev) => [
      ...prev,
      ...data.map((item) => ({
        value: item.Id,
        label: item.Name,
        description: item.Description,
        intensityLevel: item.IntensityLevel,
        impactLevel: item.ImpactLevel,
      })),
    ]);
    setTherapeuticPage(nextPage);
    setIsLoadingMoreTherapeutic(false);
  }, [therapeuticPage, fetchTherapeuticPage, isLoadingMoreTherapeutic]);

  // Load more industry (phân trang)
  const loadMoreIndustry = useCallback(async () => {
    if (isLoadingMoreIndustry) return;
    setIsLoadingMoreIndustry(true);
    const nextPage = industryPage + 1;
    const { data } = await fetchIndustryPage(nextPage, 10);
    setIndustries((prev) => [
      ...prev,
      ...data.map((item) => ({
        value: item.Id,
        label: item.IndustryName,
        description: item.Description,
      })),
    ]);
    setIndustryPage(nextPage);
    setIsLoadingMoreIndustry(false);
  }, [industryPage, fetchIndustryPage, isLoadingMoreIndustry]);

  // Prefetch dữ liệu khi mount
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchAllEmotions(),
      fetchAllImprovementGoals(),
      fetchEntertainmentPage(1, 10),
      fetchFoodPage(1, 10),
      fetchPhysicalPage(1, 10),
      fetchTherapeuticPage(1, 10),
      fetchIndustryPage(1, 10),
    ])
      .then(
        ([
          allEmotions,
          improvementGoalsRes,
          entertainmentRes,
          foodRes,
          physicalRes,
          therapeuticRes,
          industryRes,
        ]) => {
          setEmotions(allEmotions || []);
          setImprovementGoals(improvementGoalsRes || []);
          setEntertainmentActivities(
            entertainmentRes.data.map((item) => ({
              value: item.Id,
              label: item.Name,
              description: item.Description,
              intensityLevel: item.IntensityLevel,
              impactLevel: item.ImpactLevel,
            }))
          );
          setEntertainmentTotal(entertainmentRes.total);
          setEntertainmentPage(1);

          setFoodActivities(
            foodRes.data.map((item) => ({
              value: item.Id,
              label: item.Name,
              description: item.Description,
              intensityLevel: item.IntensityLevel,
              impactLevel: item.ImpactLevel,
            }))
          );
          setFoodTotal(foodRes.total);
          setFoodPage(1);

          setPhysicalActivities(
            physicalRes.data.map((item) => ({
              value: item.Id,
              label: item.Name,
              description: item.Description,
              intensityLevel: item.IntensityLevel,
              impactLevel: item.ImpactLevel,
            }))
          );
          setPhysicalTotal(physicalRes.total);
          setPhysicalPage(1);

          setTherapeuticActivities(
            therapeuticRes.data.map((item) => ({
              value: item.Id,
              label: item.Name,
              description: item.Description,
              intensityLevel: item.IntensityLevel,
              impactLevel: item.ImpactLevel,
            }))
          );
          setTherapeuticTotal(therapeuticRes.total);
          setTherapeuticPage(1);

          setIndustries(
            industryRes.data.map((item) => ({
              value: item.Id,
              label: item.IndustryName,
              description: item.Description,
            }))
          );
          setIndustryTotal(industryRes.total);
          setIndustryPage(1);
        }
      )
      .catch((err) => {
        console.error("Promise.all error in DataContext:", err);
      })
      .finally(() => setIsLoading(false));
  }, [
    fetchAllEmotions,
    fetchAllImprovementGoals,
    fetchEntertainmentPage,
    fetchFoodPage,
    fetchPhysicalPage,
    fetchTherapeuticPage,
    fetchIndustryPage,
  ]);

  return (
    <DataContext.Provider
      value={{
        emotions,
        improvementGoals,
        industries,
        industryTotal,
        industryPage,
        foodActivities,
        foodTotal,
        foodPage,
        physicalActivities,
        physicalTotal,
        physicalPage,
        therapeuticActivities,
        therapeuticTotal,
        therapeuticPage,
        entertainmentActivities,
        entertainmentTotal,
        entertainmentPage,
        isLoading,
        isLoadingMoreEntertainment,
        loadMoreEntertainment,
        isLoadingMoreFood,
        loadMoreFood,
        isLoadingMorePhysical,
        loadMorePhysical,
        isLoadingMoreTherapeutic,
        loadMoreTherapeutic,
        isLoadingMoreIndustry,
        loadMoreIndustry,
      }}>
      {children}
    </DataContext.Provider>
  );
};
