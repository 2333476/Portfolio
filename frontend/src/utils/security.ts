export const getClientUUID = (): string => {
    let uuid = localStorage.getItem('portfolio_client_uuid');
    if (!uuid) {
        uuid = crypto.randomUUID();
        localStorage.setItem('portfolio_client_uuid', uuid);
    }
    return uuid;
};
