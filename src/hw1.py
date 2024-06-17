from sympy import oo    # Import the symbol for infinity
from sympy import limit
from sympy import riemann_
# Recalculate the limit with the correct definition of infinity
integral_limit = limit(Riemann_sum, n, oo)

# Simplify the result again
integral_simplified = simplify(integral_limit)
integral_simplified
