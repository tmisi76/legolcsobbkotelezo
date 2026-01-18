import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Car, Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div 
      className="text-center py-12 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Car className="w-10 h-10 text-muted-foreground" />
        </motion.div>
      </motion.div>
      <motion.h3 
        className="text-lg font-semibold text-foreground mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>
      <motion.p 
        className="text-muted-foreground mb-6 max-w-sm mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {description}
      </motion.p>
      {actionLabel && (actionTo || onAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {actionTo ? (
            <Button asChild variant="hero" size="lg">
              <Link to={actionTo}>
                <Plus className="w-5 h-5 mr-2" />
                {actionLabel}
              </Link>
            </Button>
          ) : (
            <Button variant="hero" size="lg" onClick={onAction}>
              <Plus className="w-5 h-5 mr-2" />
              {actionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
