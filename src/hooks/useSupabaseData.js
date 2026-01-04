// src/hooks/useSupabaseData.js
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useSupabaseData = (table, options = {}) => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    filters = {},
    orderBy = 'created_at',
    orderDirection = 'desc',
    limit = null,
    realtime = false,
  } = options;

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from(table)
        .select('*')
        .eq('user_id', user.id);

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Ordenação
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      // Limite
      if (limit) {
        query = query.limit(limit);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;
      setData(result || []);
    } catch (err) {
      setError(err.message);
      console.error(`Erro ao buscar dados de ${table}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Se realtime estiver ativado, inscrever para mudanças
    if (realtime && user) {
      const channel = supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, JSON.stringify(filters)]);

  const insert = async (item) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([{ ...item, user_id: user.id }])
        .select();

      if (error) throw error;
      return { success: true, data: result[0] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const update = async (id, updates) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) throw error;
      return { success: true, data: result[0] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const remove = async (id) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    insert,
    update,
    remove,
  };
};