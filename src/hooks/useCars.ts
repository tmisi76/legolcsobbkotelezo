import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getUserCars, createCar, updateCar, deleteCar, getDaysUntilAnniversary } from "@/lib/database";
import { Car, CarInsert, CarUpdate } from "@/types/database";

export function useCars() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: cars = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cars", user?.id],
    queryFn: () => getUserCars(user!.id),
    enabled: !!user?.id,
  });

  const createCarMutation = useMutation({
    mutationFn: (carData: Omit<CarInsert, "user_id">) =>
      createCar({ ...carData, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars", user?.id] });
    },
  });

  const updateCarMutation = useMutation({
    mutationFn: ({ carId, updates }: { carId: string; updates: CarUpdate }) =>
      updateCar(carId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars", user?.id] });
    },
  });

  const deleteCarMutation = useMutation({
    mutationFn: (carId: string) => deleteCar(carId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars", user?.id] });
    },
  });

  // Get the car with the nearest anniversary
  const getNextExpiry = () => {
    if (cars.length === 0) return null;
    
    let nearest: Car | null = null;
    let nearestDays = Infinity;

    for (const car of cars) {
      const days = getDaysUntilAnniversary(car.anniversary_date);
      if (days < nearestDays) {
        nearestDays = days;
        nearest = car;
      }
    }

    return nearest ? { car: nearest, days: nearestDays } : null;
  };

  // Calculate total potential savings (18% of total fees)
  const getTotalSavings = () => {
    const totalFees = cars.reduce(
      (sum, car) => sum + (car.current_annual_fee || 0),
      0
    );
    return Math.round(totalFees * 0.18);
  };

  return {
    cars,
    isLoading,
    error,
    createCar: createCarMutation.mutateAsync,
    updateCar: updateCarMutation.mutateAsync,
    deleteCar: deleteCarMutation.mutateAsync,
    isCreating: createCarMutation.isPending,
    isUpdating: updateCarMutation.isPending,
    isDeleting: deleteCarMutation.isPending,
    getNextExpiry,
    getTotalSavings,
  };
}
