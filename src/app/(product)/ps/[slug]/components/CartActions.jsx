import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import React from 'react'

function CartActions({ loading, currentQty, variantStock, onUpdateCart }) {
    if (variantStock > 0) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg border bg-white">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onUpdateCart("remove")}
                        disabled={loading || currentQty <= 0}
                        className="rounded-r-none h-11 w-11"
                    >
                        −
                    </Button>
                    <div className="flex h-11 w-16 items-center justify-center font-medium">
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            currentQty
                        )}
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onUpdateCart("add")}
                        disabled={loading || currentQty >= variantStock}
                        className="rounded-l-none h-11 w-11"
                    >
                        +
                    </Button>
                </div>
                {variantStock < 10
                    && <p className="text-md font-semibold text-red-500">Only few left!</p>
                    // : <p className="text-md font-semibold text-green-600">In Stock</p>
                }
            </div>
        );
    }

    return null;
}

export default CartActions