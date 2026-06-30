const { initAuthCreds, BufferJSON } = require('@whiskeysockets/baileys');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const usePostgresAuthState = async (sessionId) => {
    const writeData = async (data, key) => {
        const jsonStr = JSON.stringify(data, BufferJSON.replacer);
        await prisma.whatsAppSession.upsert({
            where: {
                sessionId_key: {
                    sessionId,
                    key
                }
            },
            update: {
                value: jsonStr
            },
            create: {
                sessionId,
                key,
                value: jsonStr
            }
        });
    };

    const readData = async (key) => {
        const record = await prisma.whatsAppSession.findUnique({
            where: {
                sessionId_key: {
                    sessionId,
                    key
                }
            }
        });
        if (record) {
            return JSON.parse(record.value, BufferJSON.reviver);
        }
        return null;
    };

    const removeData = async (key) => {
        try {
            await prisma.whatsAppSession.delete({
                where: {
                    sessionId_key: {
                        sessionId,
                        key
                    }
                }
            });
        } catch (e) {
            // Ignore if doesn't exist
        }
    };

    let creds = await readData('creds');
    if (!creds) {
        creds = initAuthCreds();
        await writeData(creds, 'creds');
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                value = require('@whiskeysockets/baileys').proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            if (value) {
                                tasks.push(writeData(value, key));
                            } else {
                                tasks.push(removeData(key));
                            }
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => {
            return writeData(creds, 'creds');
        }
    };
};

const clearPostgresAuthState = async (sessionId) => {
    await prisma.whatsAppSession.deleteMany({
        where: { sessionId }
    });
};

module.exports = { usePostgresAuthState, clearPostgresAuthState };
