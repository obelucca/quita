export function handleApiError(error: any): string {
  if (!error) {
    return "Ocorreu um erro inesperado.";
  }

  // Check if it has a status property (like ApiError)
  if (typeof error.status === "number") {
    switch (error.status) {
      case 401:
        if (error.message && error.message !== "Unauthorized" && !error.message.startsWith("Request failed")) {
          return error.message;
        }
        return "Sua sessão expirou. Faça login novamente.";
      case 403:
        return "Você não possui permissão para executar esta ação.";
      case 404:
        return "O recurso solicitado não foi encontrado.";
      case 408:
        return "A operação demorou mais do que o esperado. Tente novamente.";
      case 500:
        return "Ocorreu um erro interno. Tente novamente em alguns instantes.";
      default:
        return error.message || "Ocorreu um erro ao processar sua requisição.";
    }
  }

  // Abort / Timeout errors
  if (error.name === "AbortError" || error.message?.includes("aborted") || error.message?.includes("timeout")) {
    return "A operação demorou mais do que o esperado. Tente novamente.";
  }

  // Fetch / Connection errors
  if (error.message?.includes("Failed to fetch") || error.message?.includes("network") || error.message?.includes("NetworkError")) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.";
  }

  return error.message || "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.";
}
