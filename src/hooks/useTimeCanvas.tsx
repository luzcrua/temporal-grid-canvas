
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { calculateTotalUnits, calculateElapsedUnits, TimeUnit } from "@/utils/timeCalculations";
import type { VisualizationType } from "@/components/VisualizationSelector";

type TimeCanvasContextType = {
  birthDate: Date | null;
  setBirthDate: (date: Date | null) => void;
  lifeExpectancy: number;
  setLifeExpectancy: (years: number) => void;
  timeUnit: TimeUnit;
  setTimeUnit: (unit: TimeUnit) => void;
  visualizationType: VisualizationType;
  setVisualizationType: (type: VisualizationType) => void;
  totalUnits: number;
  elapsedUnits: number;
  hasGenerated: boolean;
  setHasGenerated: (generated: boolean) => void;
};

const TimeCanvasContext = createContext<TimeCanvasContextType | undefined>(undefined);

export function TimeCanvasProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available
  const [birthDate, setBirthDateRaw] = useState<Date | null>(() => {
    const savedDate = localStorage.getItem('timecanvas-birthDate');
    return savedDate ? new Date(savedDate) : null;
  });
  
  const [lifeExpectancy, setLifeExpectancyRaw] = useState<number>(() => {
    const savedExpectancy = localStorage.getItem('timecanvas-lifeExpectancy');
    return savedExpectancy ? parseInt(savedExpectancy, 10) : 80;
  });
  
  const [timeUnit, setTimeUnitRaw] = useState<TimeUnit>(() => {
    const savedUnit = localStorage.getItem('timecanvas-timeUnit') as TimeUnit;
    return savedUnit ? savedUnit : "weeks";
  });
  
  const [visualizationType, setVisualizationTypeRaw] = useState<VisualizationType>(() => {
    const savedType = localStorage.getItem('timecanvas-visualizationType') as VisualizationType;
    return savedType ? savedType : "grid";
  });
  
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [elapsedUnits, setElapsedUnits] = useState<number>(0);
  
  const [hasGenerated, setHasGeneratedRaw] = useState<boolean>(() => {
    const savedGenerated = localStorage.getItem('timecanvas-hasGenerated');
    return savedGenerated ? savedGenerated === 'true' : false;
  });

  // Wrapper functions to update both state and localStorage
  const setBirthDate = useCallback((date: Date | null) => {
    if (date) {
      localStorage.setItem('timecanvas-birthDate', date.toISOString());
    } else {
      localStorage.removeItem('timecanvas-birthDate');
    }
    setBirthDateRaw(date);
  }, []);

  const setLifeExpectancy = useCallback((years: number) => {
    localStorage.setItem('timecanvas-lifeExpectancy', years.toString());
    setLifeExpectancyRaw(years);
  }, []);

  const setTimeUnit = useCallback((unit: TimeUnit) => {
    localStorage.setItem('timecanvas-timeUnit', unit);
    setTimeUnitRaw(unit);
  }, []);
  
  const setVisualizationType = useCallback((type: VisualizationType) => {
    localStorage.setItem('timecanvas-visualizationType', type);
    setVisualizationTypeRaw(type);
  }, []);

  const setHasGenerated = useCallback((generated: boolean) => {
    localStorage.setItem('timecanvas-hasGenerated', generated.toString());
    setHasGeneratedRaw(generated);
  }, []);

  useEffect(() => {
    if (birthDate) {
      // Use a timeout to prevent UI blocking when recalculating
      const timeoutId = setTimeout(() => {
        const total = calculateTotalUnits(birthDate, lifeExpectancy, timeUnit);
        setTotalUnits(total);
        
        const elapsed = calculateElapsedUnits(birthDate, timeUnit);
        setElapsedUnits(elapsed);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [birthDate, lifeExpectancy, timeUnit]);

  return (
    <TimeCanvasContext.Provider
      value={{
        birthDate,
        setBirthDate,
        lifeExpectancy,
        setLifeExpectancy,
        timeUnit,
        setTimeUnit,
        visualizationType,
        setVisualizationType,
        totalUnits,
        elapsedUnits,
        hasGenerated,
        setHasGenerated
      }}
    >
      {children}
    </TimeCanvasContext.Provider>
  );
}

export function useTimeCanvas() {
  const context = useContext(TimeCanvasContext);
  if (context === undefined) {
    throw new Error("useTimeCanvas must be used within a TimeCanvasProvider");
  }
  return context;
}
